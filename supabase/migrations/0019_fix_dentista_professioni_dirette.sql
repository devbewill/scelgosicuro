-- Migration 0019: Correzione AmTrust Dentista Protetto
--
-- Rimuove la struttura con q_gruppo_rischio (entità aggregata) e sostituisce
-- con professioni dirette come dimensione tariffaria, allineando il modello
-- a quello di Ingegno Protetto (q_professione come chiave rate_row).
--
-- Professioni post-migrazione:
--   odontoiatra                            → ex Gruppo 1 (no implantologia)
--   odontoiatra_implantologia_osteointegrata → ex Gruppo 2
--   odontoiatra_implantologia_altre          → ex Gruppo 3
--   ortodontista                           → ex Gruppo 1 (stesse tariffe)

-- ─────────────────────────────────────────────────────────────────────────────
-- PULIZIA — rimuove tutti i dati dentista dalla 0018 originale
-- (ordine: prima i figli, poi i genitori)
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM product_rate_rows
WHERE coverage_id IN (
  SELECT pc.id FROM product_coverages pc
  JOIN products p ON p.id = pc.product_id
  WHERE p.slug = 'amtrust-dentista-protetto'
);

DELETE FROM product_addons         WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-dentista-protetto');
DELETE FROM product_multipliers    WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-dentista-protetto');
DELETE FROM product_eligibility_rules WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-dentista-protetto');
DELETE FROM product_questions      WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-dentista-protetto');
DELETE FROM product_coverages      WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-dentista-protetto');
DELETE FROM products               WHERE slug = 'amtrust-dentista-protetto';

-- Aggiorna il nome della professione base (era senza suffisso)
UPDATE professions
SET name = 'Odontoiatra / Dentista (senza implantologia)'
WHERE slug = 'odontoiatra'
  AND sector_id = (SELECT id FROM sectors WHERE slug = 'medici');

-- Aggiunge le due nuove professioni implantologia (ortodontista già presente)
INSERT INTO professions (sector_id, slug, name, area_medica, display_order, is_active)
SELECT s.id, p.slug, p.name, p.area, p.ord, true
FROM sectors s
CROSS JOIN (VALUES
  ('odontoiatra_implantologia_osteointegrata', 'Odontoiatra con implantologia osteointegrata', 'chirurgica', 2),
  ('odontoiatra_implantologia_altre',          'Odontoiatra con implantologia altre metodiche', 'chirurgica', 3)
) AS p(slug, name, area, ord)
WHERE s.slug = 'medici'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- Corregge display_order di ortodontista (spostato in quarta posizione)
UPDATE professions
SET display_order = 4
WHERE slug = 'ortodontista'
  AND sector_id = (SELECT id FROM sectors WHERE slug = 'medici');

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODOTTO
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT ins.id, sec.id,
       'amtrust-dentista-protetto',
       'AmTrust Dentista Protetto',
       'RC Professionale e Colpa Grave per odontoiatri e ortodontisti in libera professione.',
       '2024-06',
       true
FROM insurers ins
JOIN sectors sec ON sec.slug = 'medici'
WHERE ins.slug = 'amtrust'
ON CONFLICT ON CONSTRAINT products_insurer_id_slug_version_key DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COVERAGE — dimensioni dirette: q_professione × q_massimale_rc
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_coverages (product_id, key, name, dimensions, is_mandatory)
SELECT p.id,
       'rc_professionale_dentista',
       'Responsabilità Civile Professionale + Colpa Grave',
       '["q_professione","q_massimale_rc"]'::jsonb,
       true
FROM products p
WHERE p.slug = 'amtrust-dentista-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODUCT QUESTIONS (FASE C — phase=addon)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, validation,
   position, section, is_required, visible_if, phase)
SELECT p.id, q.key, q.label, q.help_text, q.type, q.opts::jsonb, NULL,
       q.pos, q.section, false, q.vis::jsonb, 'addon'
FROM products p
CROSS JOIN (VALUES
  ('q_franchigia_dentista',
   'Franchigia',
   'La franchigia è disponibile solo in assenza di sinistri negli ultimi 5 anni.',
   'dropdown',
   '[{"value":0,"label":"Nessuna franchigia"},{"value":1000,"label":"€ 1.000 (sconto 5%)"},{"value":2500,"label":"€ 2.500 (sconto 10%)"},{"value":5000,"label":"€ 5.000 (sconto 20%)"}]',
   1, 'Franchigia',
   '{"op":"equals","key":"q_sinistri_5_anni","value":0}'),
  ('q_addon_ruolo_apicale',
   'Aggiungi: Ruolo apicale e Direzione sanitaria (+€ 50)',
   'Per chi ricopre il ruolo di Direttore Sanitario, Risk Manager o funzione analoga.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi (+€ 50)"},{"value":"no","label":"No"}]',
   2, 'Garanzie aggiuntive', 'null'),
  ('q_addon_altre_perdite',
   'Aggiungi: Perdite patrimoniali e gestione studio RCT-RCO (+€ 100)',
   'Copre danni a terzi e ai dipendenti nella gestione dello studio professionale.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi (+€ 100)"},{"value":"no","label":"No"}]',
   3, 'Garanzie aggiuntive', 'null'),
  ('q_addon_ecm',
   'Aggiungi: Omesso adempimento Crediti ECM (+€ 40)',
   'Copertura per sanzioni derivanti dal mancato assolvimento dell''obbligo ECM.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi (+€ 40)"},{"value":"no","label":"No"}]',
   4, 'Garanzie aggiuntive', 'null')
) AS q(key, label, help_text, type, opts, pos, section, vis)
WHERE p.slug = 'amtrust-dentista-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ELIGIBILITY RULES
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.prio
FROM products p
CROSS JOIN (VALUES
  ('Solo libera professione',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"dipendente"}',
   'exclude',
   'AmTrust Dentista Protetto è riservato ai liberi professionisti.',
   10),
  ('Massimale minimo 2 milioni',
   '{"op":"less_than","key":"q_massimale_rc","value":2000000}',
   'exclude',
   'AmTrust Dentista Protetto prevede massimale minimo € 2.000.000.',
   20),
  ('Sinistri > 2',
   '{"op":"greater_than","key":"q_sinistri_5_anni","value":2}',
   'manual_quote',
   'In presenza di più di 2 sinistri negli ultimi 5 anni è necessaria una valutazione della Direzione.',
   30)
) AS r(name, cond, action, reason, prio)
WHERE p.slug = 'amtrust-dentista-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- MOLTIPLICATORI
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_multipliers (product_id, name, condition, factor, priority)
SELECT p.id, m.name, m.cond::jsonb, m.factor, m.prio
FROM products p
CROSS JOIN (VALUES
  ('Età < 30 anni (-7%)',
   '{"op":"less_than","key":"q_eta","value":30}',             0.93, 10),
  ('Età 30–35 anni (-5%)',
   '{"op":"between","key":"q_eta","value":[30,35]}',          0.95, 11),
  ('Età ≥ 70 anni (+3%)',
   '{"op":"greater_than","key":"q_eta","value":69}',          1.03, 12),
  ('Attività esclusivamente in struttura (-15%)',
   '{"op":"equals","key":"q_attivita_struttura","value":"una_struttura"}', 0.85, 20),
  ('1 sinistro negli ultimi 5 anni (+15%)',
   '{"op":"equals","key":"q_sinistri_5_anni","value":1}',     1.15, 30),
  ('2 sinistri negli ultimi 5 anni (+100%)',
   '{"op":"equals","key":"q_sinistri_5_anni","value":2}',     2.00, 31),
  ('Franchigia € 1.000 (-5%)',
   '{"op":"equals","key":"q_franchigia_dentista","value":1000}', 0.95, 40),
  ('Franchigia € 2.500 (-10%)',
   '{"op":"equals","key":"q_franchigia_dentista","value":2500}', 0.90, 41),
  ('Franchigia € 5.000 (-20%)',
   '{"op":"equals","key":"q_franchigia_dentista","value":5000}', 0.80, 42)
) AS m(name, cond, factor, prio)
WHERE p.slug = 'amtrust-dentista-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- ADD-ON FLAT
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by)
SELECT p.id, a.key, a.name, 'flat', a.premium, a.trig::jsonb
FROM products p
CROSS JOIN (VALUES
  ('retro_illimitata',
   'Sovrappremio Retroattività Illimitata',
   45.00,
   '{"op":"equals","key":"q_retroattivita","value":"illimitata"}'),
  ('ruolo_apicale',
   'Ruolo apicale e Direzione sanitaria',
   50.00,
   '{"op":"equals","key":"q_addon_ruolo_apicale","value":"si"}'),
  ('rct_rco',
   'Perdite patrimoniali e gestione studio (RCT-RCO)',
   100.00,
   '{"op":"equals","key":"q_addon_altre_perdite","value":"si"}'),
  ('crediti_ecm',
   'Omesso adempimento Crediti ECM',
   40.00,
   '{"op":"equals","key":"q_addon_ecm","value":"si"}')
) AS a(key, name, premium, trig)
WHERE p.slug = 'amtrust-dentista-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- RATE ROWS (12 righe: 4 professioni × 3 massimali)
-- Fonte: Tariffario AmTrust Dentista Protetto Agg. 06/2024
-- ─────────────────────────────────────────────────────────────────────────────

-- Gruppo 1: Odontoiatra senza implantologia + Ortodontista (tariffe identiche)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-dentista-protetto'
CROSS JOIN (VALUES ('odontoiatra'), ('ortodontista')) AS prof(slug)
CROSS JOIN (VALUES
  (2000000,  842.00),
  (3000000,  884.00),
  (5000000,  919.00)
) AS r(mass, premium)
WHERE cov.key = 'rc_professionale_dentista';

-- Gruppo 2: Odontoiatra con implantologia osteointegrata
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', 'odontoiatra_implantologia_osteointegrata',
                          'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-dentista-protetto'
CROSS JOIN (VALUES
  (2000000, 1684.00),
  (3000000, 1735.00),
  (5000000, 1770.00)
) AS r(mass, premium)
WHERE cov.key = 'rc_professionale_dentista';

-- Gruppo 3: Odontoiatra con implantologia altre metodiche
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', 'odontoiatra_implantologia_altre',
                          'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-dentista-protetto'
CROSS JOIN (VALUES
  (2000000, 2105.00),
  (3000000, 2168.00),
  (5000000, 2211.00)
) AS r(mass, premium)
WHERE cov.key = 'rc_professionale_dentista';
