-- ─────────────────────────────────────────────────────────────────────────────
-- Estensioni di Garanzia — AmTrust Medico Protetto (product_id = 1)
--
-- Solo per Aree mediche NON CHIRURGICHE (visible_if / available_if su q_tipo_area_medica).
--
-- Logica tariffario:
--   Medicina Estetica          → pagamento se gruppo ≤ 15, gratis se gruppo > 15
--   Attività Invasive minori   → pagamento se gruppo ≤ 20, gratis se gruppo > 20
--   Att. Invasive e Soccorso   → pagamento se gruppo ≤ 21, gratis se gruppo > 21
--
-- I prezzi del sovrappremio NON sono nel tariffario PDF e devono essere forniti
-- da AmTrust. Fino ad allora le righe "a pagamento" hanno manual_quote = true.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Domande di prodotto per le 2 estensioni
INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, validation, position, section, is_required, visible_if, phase)
VALUES
  (1, 'q_addon_medicina_estetica',
   'Svolgi anche attività di Medicina Estetica?',
   'Fare riferimento alle Condizioni di Assicurazione per la definizione di Medicina Estetica coperta.',
   'dropdown',
   '[{"label":"Sì","value":"si"},{"label":"No","value":"no"}]',
   null, 13, 'Estensioni di Garanzia', false,
   '{"op":"equals","key":"q_tipo_area_medica","value":"non_chirurgica"}',
   'addon'),

  (1, 'q_addon_attivita_invasive',
   'Svolgi anche attività invasive?',
   'Fare riferimento alle Condizioni di Assicurazione per la definizione di attività invasive.',
   'dropdown',
   '[{"label":"No","value":"no"},{"label":"Sì – Attività Invasive Minori","value":"minori"},{"label":"Sì – Attività Invasive e Mezzi di Soccorso","value":"soccorso"}]',
   null, 14, 'Estensioni di Garanzia', false,
   '{"op":"equals","key":"q_tipo_area_medica","value":"non_chirurgica"}',
   'addon')
ON CONFLICT DO NOTHING;

-- 2. Addon con rate_table (una riga per professione)
INSERT INTO product_addons
  (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions)
VALUES
  (1, 'medicina_estetica',
   'Estensione Medicina Estetica',
   'rate_table', NULL,
   '{"op":"equals","key":"q_addon_medicina_estetica","value":"si"}',
   '{"op":"equals","key":"q_tipo_area_medica","value":"non_chirurgica"}',
   '["q_professione"]'),

  (1, 'attivita_invasive_minori',
   'Estensione Attività Invasive Minori',
   'rate_table', NULL,
   '{"op":"equals","key":"q_addon_attivita_invasive","value":"minori"}',
   '{"op":"equals","key":"q_tipo_area_medica","value":"non_chirurgica"}',
   '["q_professione"]'),

  (1, 'attivita_invasive_soccorso',
   'Estensione Attività Invasive e Mezzi di Soccorso',
   'rate_table', NULL,
   '{"op":"equals","key":"q_addon_attivita_invasive","value":"soccorso"}',
   '{"op":"equals","key":"q_tipo_area_medica","value":"non_chirurgica"}',
   '["q_professione"]')
ON CONFLICT DO NOTHING;

-- 3. Addon rate rows: 55 professioni non-chirurgiche × 3 addon = 165 righe
--    is_paid = true  → manual_quote = true, premium = 0 (prezzo da definire con AmTrust)
--    is_paid = false → manual_quote = false, premium = 0 (inclusa gratuitamente)
WITH prof_groups(slug, grp) AS (
  VALUES
    -- gruppo  1
    ('mmg',                       1), ('medico_comunita',          1),
    ('medico_abilitato',          1), ('medicina_termale',         1),
    ('medicine_non_convenzionali',1), ('pediatra_libera_scelta',   1),
    ('scienze_alimentazione',     1),
    -- gruppo  2
    ('audiologia',                2), ('farmacologia',             2),
    ('genetica_medica',           2), ('microbiologia',            2),
    ('patologia_clinica',         2),
    -- gruppo  3
    ('medicina_legale',           3),
    -- gruppo  4
    ('neuropsichiatria',          4), ('psichiatria',              4),
    ('psicologia_clinica',        4),
    -- gruppo  5
    ('allergologia',              5), ('angiologia',               5),
    ('diabetologia',              5), ('endocrinologia',           5),
    ('malattie_infettive',        5),
    -- gruppo  6
    ('oculistica',                6),
    -- gruppo  7
    ('medicina_nucleare',         7),
    -- gruppo  8
    ('diagnostica_ecografica',    8), ('epatologia',               8),
    ('gastroenterologia',         8), ('geriatria',                8),
    ('medicina_emergenza',        8), ('medicina_interna',         8),
    ('nefrologia',                8), ('pneumologia',              8),
    ('visite_preoperatorie',      8),
    -- gruppo  9
    ('patologia',                 9), ('dermatologia',             9),
    ('ematologia',                9), ('oncologia',                9),
    -- gruppo 10
    ('pediatra_specialista',     10),
    -- gruppo 11
    ('terapia_dolore',           11),
    -- gruppo 12
    ('fisiatria',                12), ('neurofisiopatologia',      12),
    ('neurologia',               12),
    -- gruppo 13
    ('igiene_medicina_preventiva',13), ('medicina_aeronautica',   13),
    ('medicina_del_lavoro',      13), ('statistica_sanitaria',    13),
    -- gruppo 14
    ('radioterapia',             14),
    -- gruppo 15
    ('otorinolaringoiatria',     15),
    -- gruppo 16
    ('radiodiagnostica',         16),
    -- gruppo 17
    ('cardiologia',              17),
    -- gruppo 18  (nota: ortopedia non ha massimale 1M)
    ('ortopedia',                18),
    -- gruppo 19
    ('reumatologia',             19),
    -- gruppo 20
    ('medicina_dello_sport',     20),
    -- gruppo 21
    ('andrologia',               21), ('urologia',                21),
    -- gruppo 29  (non-chirurgica)
    ('ginecologia',              29)
),
addon_ids AS (
  SELECT id, key
  FROM product_addons
  WHERE product_id = 1
    AND key IN ('medicina_estetica', 'attivita_invasive_minori', 'attivita_invasive_soccorso')
),
combined AS (
  SELECT
    a.id   AS addon_id,
    a.key  AS addon_key,
    pg.slug,
    CASE
      WHEN a.key = 'medicina_estetica'        THEN pg.grp <= 15
      WHEN a.key = 'attivita_invasive_minori' THEN pg.grp <= 20
      WHEN a.key = 'attivita_invasive_soccorso' THEN pg.grp <= 21
    END AS is_paid
  FROM prof_groups pg
  CROSS JOIN addon_ids a
)
INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT
  addon_id,
  jsonb_build_object('q_professione', slug),
  0.0,
  is_paid
FROM combined
ON CONFLICT DO NOTHING;
