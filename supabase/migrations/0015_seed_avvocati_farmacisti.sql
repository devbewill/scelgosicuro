-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0015: seed settori Avvocati e Farmacisti
--
-- Prodotti:
--   AmTrust ProfessioniIntellettuali – Avvocati (Conv. 0091, Ed. 09/2021)
--   AmTrust Farmacista Protetto (Ed. 09/2025)
--
-- Dati estratti dai JSON in supabase/seed/products/
-- ─────────────────────────────────────────────────────────────────────────────

-- =====================================================
-- SETTORE AVVOCATI
-- =====================================================

INSERT INTO sectors (slug, name, description, display_order, is_active)
VALUES ('avvocati', 'Avvocati', 'RC Professionale per avvocati e studi legali', 2, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, 'avvocato', 'Avvocato', 1, true
FROM sectors s WHERE s.slug = 'avvocati'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- Prodotto (delete + re-insert per idempotenza)
DELETE FROM products
WHERE slug = 'amtrust-avvocato'
  AND insurer_id = (SELECT id FROM insurers WHERE slug = 'amtrust');

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id,
  'amtrust-avvocato',
  'AmTrust ProfessioniIntellettuali – Avvocati (Conv. 0091)',
  'RC Professionale, Infortuni e RSM per avvocati e studi legali – Conv.0091',
  '2021-09', true
FROM insurers i, sectors s
WHERE i.slug = 'amtrust' AND s.slug = 'avvocati';

-- ── Sector questions ──────────────────────────────────────────────────────────
-- is_required: true → FASE B (obbligatoria) | false → FASE C (opzionale)

INSERT INTO sector_questions
  (sector_id, key, label, type, options, validation, position, is_required)
SELECT s.id, q.key, q.label, q.type, q.opts::jsonb, q.validation::jsonb, q.pos, q.required
FROM sectors s,
(VALUES
  ('q_tipo_assicurato_avvocato',
   'Tipologia di assicurato',
   'dropdown',
   '[{"value":"avvocato","label":"Avvocato (professionista individuale)"},{"value":"studio_stp","label":"Studio Associato / Società tra Professionisti"}]',
   NULL, 1, true),
  ('q_fascia_compensi',
   'Fascia di compensi annui',
   'dropdown',
   '[{"value":"0_30k","label":"Fino a €30.000"},{"value":"30_50k","label":"€30.001 – €50.000"},{"value":"50_70k","label":"€50.001 – €70.000"},{"value":"70_150k","label":"€70.001 – €150.000"},{"value":"150_300k","label":"€150.001 – €300.000"},{"value":"300_500k","label":"€300.001 – €500.000"},{"value":"500_1M","label":"€500.001 – €1.000.000"},{"value":"1M_2M","label":"€1.000.001 – €2.000.000"},{"value":"2M_5M","label":"€2.000.001 – €5.000.000"},{"value":"over_5M","label":"Oltre €5.000.000"}]',
   NULL, 2, true),
  ('q_sinistri_5_anni',
   'Sinistri negli ultimi 5 anni',
   'number',
   NULL,
   '{"min":0,"max":10,"step":1}', 3, true),
  ('q_massimale_rc',
   'Massimale RC desiderato',
   'dropdown',
   '[{"value":350000,"label":"€350.000"},{"value":500000,"label":"€500.000"},{"value":1000000,"label":"€1.000.000"},{"value":1500000,"label":"€1.500.000"},{"value":2000000,"label":"€2.000.000"},{"value":4000000,"label":"€4.000.000"},{"value":5000000,"label":"€5.000.000"}]',
   NULL, 4, false)
) AS q(key, label, type, opts, validation, pos, required)
WHERE s.slug = 'avvocati'
ON CONFLICT (sector_id, key) DO NOTHING;

-- ── Product coverage ──────────────────────────────────────────────────────────

INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id,
  'rc_professionale',
  'Garanzia A – RC Professionale e RCT/O',
  true,
  '["q_tipo_assicurato_avvocato","q_fascia_compensi","q_massimale_rc"]'::jsonb
FROM products p WHERE p.slug = 'amtrust-avvocato';

-- ── Rate rows – avvocato singolo (righe con prezzo) ───────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
  jsonb_build_object(
    'q_tipo_assicurato_avvocato', r.tipo,
    'q_fascia_compensi',          r.fascia,
    'q_massimale_rc',             r.mass),
  r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato', '0_30k',     350000,   185.00),
  ('avvocato', '0_30k',     500000,   210.00),
  ('avvocato', '0_30k',    1000000,   250.00),
  ('avvocato', '30_50k',    500000,   235.00),
  ('avvocato', '30_50k',   1000000,   290.00),
  ('avvocato', '30_50k',   1500000,   360.00),
  ('avvocato', '30_50k',   2000000,   400.00),
  ('avvocato', '30_50k',   4000000,   550.00),
  ('avvocato', '50_70k',    500000,   305.00),
  ('avvocato', '50_70k',   1000000,   420.00),
  ('avvocato', '50_70k',   1500000,   525.00),
  ('avvocato', '50_70k',   2000000,   750.00),
  ('avvocato', '50_70k',   4000000,   800.00),
  ('avvocato', '70_150k',  1000000,   500.00),
  ('avvocato', '70_150k',  1500000,   720.00),
  ('avvocato', '70_150k',  2000000,   890.00),
  ('avvocato', '70_150k',  4000000,   980.00),
  ('avvocato', '150_300k', 1000000,   990.00),
  ('avvocato', '150_300k', 1500000,  1200.00),
  ('avvocato', '150_300k', 2000000,  1400.00),
  ('avvocato', '150_300k', 4000000,  1600.00),
  ('avvocato', '300_500k', 1000000,  1200.00),
  ('avvocato', '300_500k', 1500000,  1560.00),
  ('avvocato', '300_500k', 2000000,  1800.00),
  ('avvocato', '300_500k', 4000000,  2000.00),
  ('avvocato', '500_1M',   1000000,  1800.00),
  ('avvocato', '500_1M',   1500000,  2160.00),
  ('avvocato', '500_1M',   2000000,  2520.00),
  ('avvocato', '500_1M',   4000000,  2700.00)
) AS r(tipo, fascia, mass, premium)
WHERE cov.key = 'rc_professionale';

-- ── Rate rows – studio STP (righe con prezzo) ─────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
  jsonb_build_object(
    'q_tipo_assicurato_avvocato', r.tipo,
    'q_fascia_compensi',          r.fascia,
    'q_massimale_rc',             r.mass),
  r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('studio_stp', '30_50k',   1000000,   650.00),
  ('studio_stp', '30_50k',   2000000,   850.00),
  ('studio_stp', '50_70k',   1000000,   730.00),
  ('studio_stp', '50_70k',   2000000,   910.00),
  ('studio_stp', '70_150k',  1000000,   810.00),
  ('studio_stp', '70_150k',  2000000,   970.00),
  ('studio_stp', '150_300k', 1000000,  1050.00),
  ('studio_stp', '150_300k', 2000000,  1400.00),
  ('studio_stp', '300_500k', 1000000,  1380.00),
  ('studio_stp', '300_500k', 2000000,  1900.00),
  ('studio_stp', '500_1M',   2000000,  2890.00)
) AS r(tipo, fascia, mass, premium)
WHERE cov.key = 'rc_professionale';

-- ── Rate rows – Valutazione Direzionale ───────────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
  jsonb_build_object(
    'q_tipo_assicurato_avvocato', r.tipo,
    'q_fascia_compensi',          r.fascia,
    'q_massimale_rc',             r.mass),
  NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  -- avvocato singolo: massimali non disponibili per fascia bassa
  ('avvocato', '0_30k',     1500000),
  ('avvocato', '0_30k',     2000000),
  ('avvocato', '0_30k',     4000000),
  ('avvocato', '0_30k',     5000000),
  ('avvocato', '30_50k',     350000),
  ('avvocato', '30_50k',    5000000),
  ('avvocato', '50_70k',     350000),
  ('avvocato', '50_70k',    5000000),
  ('avvocato', '70_150k',    350000),
  ('avvocato', '70_150k',    500000),
  ('avvocato', '70_150k',   5000000),
  ('avvocato', '150_300k',   350000),
  ('avvocato', '150_300k',   500000),
  ('avvocato', '150_300k',  5000000),
  ('avvocato', '300_500k',   350000),
  ('avvocato', '300_500k',   500000),
  ('avvocato', '300_500k',  5000000),
  ('avvocato', '500_1M',     350000),
  ('avvocato', '500_1M',     500000),
  ('avvocato', '500_1M',    5000000),
  -- avvocato singolo: fasce compensi alte (tutto VD)
  ('avvocato', '1M_2M',      350000),
  ('avvocato', '1M_2M',      500000),
  ('avvocato', '1M_2M',     1000000),
  ('avvocato', '1M_2M',     1500000),
  ('avvocato', '1M_2M',     2000000),
  ('avvocato', '1M_2M',     4000000),
  ('avvocato', '1M_2M',     5000000),
  ('avvocato', '2M_5M',      350000),
  ('avvocato', '2M_5M',      500000),
  ('avvocato', '2M_5M',     1000000),
  ('avvocato', '2M_5M',     1500000),
  ('avvocato', '2M_5M',     2000000),
  ('avvocato', '2M_5M',     4000000),
  ('avvocato', '2M_5M',     5000000),
  ('avvocato', 'over_5M',    350000),
  ('avvocato', 'over_5M',    500000),
  ('avvocato', 'over_5M',   1000000),
  ('avvocato', 'over_5M',   1500000),
  ('avvocato', 'over_5M',   2000000),
  ('avvocato', 'over_5M',   4000000),
  ('avvocato', 'over_5M',   5000000),
  -- studio STP: fascia 0-30k non disponibile, fascia 500k-1M solo massimale 2M
  ('studio_stp', '0_30k',   1000000),
  ('studio_stp', '0_30k',   2000000),
  ('studio_stp', '500_1M',  1000000),
  ('studio_stp', '1M_2M',   1000000),
  ('studio_stp', '1M_2M',   2000000),
  ('studio_stp', '2M_5M',   1000000),
  ('studio_stp', '2M_5M',   2000000),
  ('studio_stp', 'over_5M', 1000000),
  ('studio_stp', 'over_5M', 2000000)
) AS r(tipo, fascia, mass)
WHERE cov.key = 'rc_professionale';

-- ── Eligibility rule ──────────────────────────────────────────────────────────

INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id,
  'Sinistri pregressi → valutazione direzionale',
  '{"key":"q_sinistri_5_anni","op":"greater_than","value":0}'::jsonb,
  'manual_quote',
  'In presenza di sinistri pregressi l''assumibilità è soggetta a valutazione della Direzione AmTrust',
  10
FROM products p WHERE p.slug = 'amtrust-avvocato';

-- ── Multiplier: Franchigia Facoltativa (-14%) ─────────────────────────────────

INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id,
  (SELECT id FROM product_coverages WHERE product_id = p.id AND key = 'rc_professionale'),
  'Franchigia Facoltativa (-14%)',
  0.86,
  '{"key":"q_franchigia_facoltativa_avv","op":"equals","value":"si"}'::jsonb,
  10
FROM products p WHERE p.slug = 'amtrust-avvocato';

-- ── Product questions (addon phase) ──────────────────────────────────────────

INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, position, section, is_required, phase)
SELECT p.id, q.key, q.label, q.help, 'dropdown', q.opts::jsonb, q.pos,
  'Garanzie Aggiuntive', false, 'addon'
FROM products p
CROSS JOIN (VALUES
  ('q_franchigia_facoltativa_avv',
   'Aggiungere Franchigia Facoltativa (sconto -14% sulla RC)?',
   'Scoperto 10% con minimo €5.000. Riduzione del 14% sul premio Garanzia A.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì – applica franchigia (-14%)"}]',
   1),
  ('q_garanzia_a1_sindaco_revisore',
   'Aggiungere A.1 – Estensione Sindaco / Revisore Legale / CdA?',
   'Sottolimite 50% del massimale, max €2.000.000. Scoperto 10% minimo €5.000.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì"}]',
   2),
  ('q_garanzia_a2_funzioni_pubbliche',
   'Aggiungere A.2 – Funzioni Pubbliche?',
   'Massimale di polizza. Franchigia €500.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì"}]',
   3),
  ('q_garanzia_a3_gestore_occ',
   'Aggiungere A.3 – Gestore dell''O.C.C.?',
   'Sottolimite massimale max €1.000.000. Franchigia €500.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì"}]',
   4),
  ('q_garanzia_a4_dpo',
   'Aggiungere A.4 – D.P.O.?',
   'Sottolimite massimale max €500.000. Franchigia €2.500.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì"}]',
   5),
  ('q_infortuni_opzione_avv',
   'Sezione B – Infortuni e Rimborso Spese Mediche (opzionale)',
   'Opzione 1: rischio professionale + in itinere. Opzione 2: + rischio extra-professionale.',
   '[{"value":"none","label":"Nessuna"},{"value":"opzione_1","label":"B.1 – Prof. + Itinere (€145)"},{"value":"opzione_2","label":"B.2 – Prof. + Itinere + Extra (€200)"}]',
   6)
) AS q(key, label, help, opts, pos)
WHERE p.slug = 'amtrust-avvocato'
ON CONFLICT (product_id, key) DO NOTHING;

-- ── Addons flat ───────────────────────────────────────────────────────────────

INSERT INTO product_addons
  (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions)
SELECT p.id, a.key, a.name, 'flat', a.premium, a.trigger::jsonb, NULL, NULL
FROM products p
CROSS JOIN (VALUES
  ('infortuni_opzione_1',
   'B.1 Infortuni + RSM: rischio professionale + in itinere',
   145.00,
   '{"op":"equals","key":"q_infortuni_opzione_avv","value":"opzione_1"}'),
  ('infortuni_opzione_2',
   'B.2 Infortuni + RSM: rischio professionale + in itinere + extra-professionale',
   200.00,
   '{"op":"equals","key":"q_infortuni_opzione_avv","value":"opzione_2"}')
) AS a(key, name, premium, trigger)
WHERE p.slug = 'amtrust-avvocato';

-- ── Addons rate_table (A.1-A.4 — prezzo dipende da tipo + fascia compensi) ────

INSERT INTO product_addons
  (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions)
SELECT p.id, a.key, a.name, 'rate_table', NULL, a.trigger::jsonb, NULL,
  '["q_tipo_assicurato_avvocato","q_fascia_compensi"]'::jsonb
FROM products p
CROSS JOIN (VALUES
  ('garanzia_a1_sindaco_revisore',
   'A.1 Estensione Sindaco/Revisore Legale/CdA (sottolimite 50% max €2M)',
   '{"op":"equals","key":"q_garanzia_a1_sindaco_revisore","value":"si"}'),
  ('garanzia_a2_funzioni_pubbliche',
   'A.2 Funzioni Pubbliche',
   '{"op":"equals","key":"q_garanzia_a2_funzioni_pubbliche","value":"si"}'),
  ('garanzia_a3_gestore_occ',
   'A.3 Gestore dell''O.C.C. (sottolimite €1.000.000)',
   '{"op":"equals","key":"q_garanzia_a3_gestore_occ","value":"si"}'),
  ('garanzia_a4_dpo',
   'A.4 D.P.O. (sottolimite €500.000)',
   '{"op":"equals","key":"q_garanzia_a4_dpo","value":"si"}')
) AS a(key, name, trigger)
WHERE p.slug = 'amtrust-avvocato';

-- ── Addon rate rows – A.1 Sindaco/Revisore/CdA ───────────────────────────────

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id,
  jsonb_build_object('q_tipo_assicurato_avvocato', r.tipo, 'q_fascia_compensi', r.fascia),
  r.premium, false
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato',   '0_30k',    280.00),
  ('avvocato',   '30_50k',   280.00),
  ('avvocato',   '50_70k',   280.00),
  ('avvocato',   '70_150k',  450.00),
  ('avvocato',   '150_300k', 450.00),
  ('avvocato',   '300_500k', 450.00),
  ('avvocato',   '500_1M',   450.00),
  ('studio_stp', '30_50k',   450.00),
  ('studio_stp', '50_70k',   450.00),
  ('studio_stp', '70_150k',  450.00),
  ('studio_stp', '150_300k', 450.00),
  ('studio_stp', '300_500k', 600.00),
  ('studio_stp', '500_1M',   600.00)
) AS r(tipo, fascia, premium)
WHERE a.key = 'garanzia_a1_sindaco_revisore';

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id,
  jsonb_build_object('q_tipo_assicurato_avvocato', r.tipo, 'q_fascia_compensi', r.fascia),
  NULL, true
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato',   '1M_2M'),
  ('avvocato',   '2M_5M'),
  ('avvocato',   'over_5M'),
  ('studio_stp', '0_30k'),
  ('studio_stp', '1M_2M'),
  ('studio_stp', '2M_5M'),
  ('studio_stp', 'over_5M')
) AS r(tipo, fascia)
WHERE a.key = 'garanzia_a1_sindaco_revisore';

-- ── Addon rate rows – A.2 Funzioni Pubbliche ─────────────────────────────────

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id,
  jsonb_build_object('q_tipo_assicurato_avvocato', r.tipo, 'q_fascia_compensi', r.fascia),
  r.premium, false
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato',   '0_30k',    120.00),
  ('avvocato',   '30_50k',   120.00),
  ('avvocato',   '50_70k',   120.00),
  ('avvocato',   '70_150k',  150.00),
  ('avvocato',   '150_300k', 150.00),
  ('avvocato',   '300_500k', 150.00),
  ('avvocato',   '500_1M',   150.00),
  ('studio_stp', '30_50k',   200.00),
  ('studio_stp', '50_70k',   200.00),
  ('studio_stp', '70_150k',  200.00),
  ('studio_stp', '150_300k', 200.00),
  ('studio_stp', '300_500k', 350.00),
  ('studio_stp', '500_1M',   350.00)
) AS r(tipo, fascia, premium)
WHERE a.key = 'garanzia_a2_funzioni_pubbliche';

-- ── Addon rate rows – A.3 Gestore O.C.C. ─────────────────────────────────────

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id,
  jsonb_build_object('q_tipo_assicurato_avvocato', r.tipo, 'q_fascia_compensi', r.fascia),
  r.premium, false
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato',   '0_30k',     80.00),
  ('avvocato',   '30_50k',    80.00),
  ('avvocato',   '50_70k',    80.00),
  ('avvocato',   '70_150k',  150.00),
  ('avvocato',   '150_300k', 150.00),
  ('avvocato',   '300_500k', 150.00),
  ('avvocato',   '500_1M',   150.00),
  ('studio_stp', '30_50k',   150.00),
  ('studio_stp', '50_70k',   150.00),
  ('studio_stp', '70_150k',  150.00),
  ('studio_stp', '150_300k', 150.00),
  ('studio_stp', '300_500k', 250.00),
  ('studio_stp', '500_1M',   250.00)
) AS r(tipo, fascia, premium)
WHERE a.key = 'garanzia_a3_gestore_occ';

-- ── Addon rate rows – A.4 D.P.O. ─────────────────────────────────────────────

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id,
  jsonb_build_object('q_tipo_assicurato_avvocato', r.tipo, 'q_fascia_compensi', r.fascia),
  r.premium, false
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-avvocato'
CROSS JOIN (VALUES
  ('avvocato',   '0_30k',    150.00),
  ('avvocato',   '30_50k',   150.00),
  ('avvocato',   '50_70k',   150.00),
  ('avvocato',   '70_150k',  150.00),
  ('avvocato',   '150_300k', 150.00),
  ('avvocato',   '300_500k', 150.00),
  ('avvocato',   '500_1M',   150.00),
  ('studio_stp', '30_50k',   250.00),
  ('studio_stp', '50_70k',   250.00),
  ('studio_stp', '70_150k',  250.00),
  ('studio_stp', '150_300k', 250.00),
  ('studio_stp', '300_500k', 250.00),
  ('studio_stp', '500_1M',   250.00)
) AS r(tipo, fascia, premium)
WHERE a.key = 'garanzia_a4_dpo';


-- =====================================================
-- SETTORE FARMACISTI
-- =====================================================

INSERT INTO sectors (slug, name, description, display_order, is_active)
VALUES ('farmacisti', 'Farmacisti', 'RC Professionale per farmacisti', 6, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, 'farmacista', 'Farmacista', 1, true
FROM sectors s WHERE s.slug = 'farmacisti'
ON CONFLICT (sector_id, slug) DO NOTHING;

DELETE FROM products
WHERE slug = 'amtrust-farmacista-protetto'
  AND insurer_id = (SELECT id FROM insurers WHERE slug = 'amtrust');

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id,
  'amtrust-farmacista-protetto',
  'AmTrust Farmacista Protetto',
  'RC Professionale – Colpa Grave e RC Civile per Farmacisti',
  '2025-09', true
FROM insurers i, sectors s
WHERE i.slug = 'amtrust' AND s.slug = 'farmacisti';

-- ── Sector questions ──────────────────────────────────────────────────────────

INSERT INTO sector_questions
  (sector_id, key, label, type, options, validation, position, is_required)
SELECT s.id, q.key, q.label, q.type, q.opts::jsonb, q.validation::jsonb, q.pos, q.required
FROM sectors s,
(VALUES
  ('q_tipo_copertura',
   'Tipologia di copertura',
   'dropdown',
   '[{"value":"solo_colpa_grave","label":"Solo Colpa Grave"},{"value":"rc_e_colpa_grave","label":"Responsabilità Civile e Colpa Grave"}]',
   NULL, 1, true),
  ('q_massimale_sinistro',
   'Massimale per sinistro',
   'dropdown',
   '[{"value":1000000,"label":"€1.000.000"},{"value":2000000,"label":"€2.000.000"},{"value":3000000,"label":"€3.000.000"}]',
   NULL, 2, true),
  ('q_sinistri_5_anni',
   'Sinistri negli ultimi 5 anni',
   'number',
   NULL,
   '{"min":0,"max":10,"step":1}', 3, true),
  ('q_retroattivita_rc',
   'Retroattività',
   'dropdown',
   '[{"value":"10_anni","label":"10 anni (inclusa nel premio)"},{"value":"illimitata","label":"Illimitata (+€10)"}]',
   NULL, 4, false)
) AS q(key, label, type, opts, validation, pos, required)
WHERE s.slug = 'farmacisti'
ON CONFLICT (sector_id, key) DO NOTHING;

-- ── Product coverage ──────────────────────────────────────────────────────────

INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id,
  'rc_professionale',
  'RC Professionale – Farmacista',
  true,
  '["q_massimale_sinistro","q_tipo_copertura"]'::jsonb
FROM products p WHERE p.slug = 'amtrust-farmacista-protetto';

-- ── Rate rows (6 combinazioni massimale × tipo copertura) ─────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
  jsonb_build_object('q_massimale_sinistro', r.mass, 'q_tipo_copertura', r.tipo),
  r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-farmacista-protetto'
CROSS JOIN (VALUES
  (1000000, 'solo_colpa_grave',  54.00),
  (1000000, 'rc_e_colpa_grave', 110.00),
  (2000000, 'solo_colpa_grave',  65.00),
  (2000000, 'rc_e_colpa_grave', 132.00),
  (3000000, 'solo_colpa_grave',  73.00),
  (3000000, 'rc_e_colpa_grave', 149.00)
) AS r(mass, tipo, premium)
WHERE cov.key = 'rc_professionale';

-- ── Eligibility rule ──────────────────────────────────────────────────────────

INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id,
  'Sinistri / fatti noti → valutazione direzionale',
  '{"key":"q_sinistri_5_anni","op":"greater_than","value":0}'::jsonb,
  'manual_quote',
  'In presenza di Fatti Noti o sinistri pregressi la quotazione è riservata alla Direzione AmTrust',
  10
FROM products p WHERE p.slug = 'amtrust-farmacista-protetto';

-- ── Product question (addon) ──────────────────────────────────────────────────

INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, position, section, is_required, phase)
SELECT p.id,
  'q_addon_rc_plus',
  'Aggiungere RC Plus?',
  'Estensione della copertura RC con garanzie aggiuntive.',
  'dropdown',
  '[{"value":"no","label":"No"},{"value":"si","label":"Sì (+€75)"}]'::jsonb,
  1, 'Garanzie Aggiuntive', false, 'addon'
FROM products p WHERE p.slug = 'amtrust-farmacista-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- ── Addons flat ───────────────────────────────────────────────────────────────

INSERT INTO product_addons
  (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions)
SELECT p.id, a.key, a.name, 'flat', a.premium, a.trigger::jsonb, NULL, NULL
FROM products p
CROSS JOIN (VALUES
  ('retroattivita_illimitata',
   'Estensione retroattività illimitata',
   10.00,
   '{"op":"equals","key":"q_retroattivita_rc","value":"illimitata"}'),
  ('rc_plus',
   'RC Plus',
   75.00,
   '{"op":"equals","key":"q_addon_rc_plus","value":"si"}')
) AS a(key, name, premium, trigger)
WHERE p.slug = 'amtrust-farmacista-protetto';
