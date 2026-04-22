-- Migration 0017: AmTrust Ingegno Protetto – Linea Professione Protetta
--
-- Settore: tecnici (Professionisti Tecnici)
-- Professioni: architetto, ingegnere, geometra, perito_industriale, agronomo
-- Insurer: amtrust (già in DB)
--
-- Struttura tariffaria:
--   4 dimensioni: q_professione × q_fatturato × q_massimale_rc × q_retroattivita
--   13 fasce fatturato × 6 massimali (250k–2.5M) × 2 retroattività = fino a 156 celle/professione
--   Celle RD: massimale >= 3M e fascia oltre_500k → eligibility_rule manual_quote
--   Celle RD intermedie (prof+fascia+massimale specifici) → rate_row con manual_quote=true
--
-- Multipliers: sinistri (+10%/+20%), franchigia dimezzata (+10%), raddoppiata (-10%),
--   sconto anni iscrizione albo (0→-40% … 9→-2%)
-- Addons flat: DPO (€187), Cyber Liability (€185)
-- NON incluse in questa migration: Sezione Tutela Legale e Sezione Infortuni

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Settore
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sectors (slug, name, description, display_order, is_active)
VALUES ('tecnici', 'Professionisti Tecnici',
        'RC Professionale per architetti, ingegneri, geometri, periti e agronomi', 3, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Professioni (5 categorie tariffarie)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, p.slug, p.name, p.ord, true
FROM sectors s,
(VALUES
  ('architetto',        'Architetto, Pianificatore, Paesaggista e Conservatore', 1),
  ('ingegnere',         'Ingegnere',                                             2),
  ('geometra',          'Geometra e Geometra Laureato',                          3),
  ('perito_industriale','Perito Industriale e Perito Industriale Laureato',      4),
  ('agronomo',          'Dottore Agronomo e Forestale, Agrotecnico e Perito Agrario', 5)
) AS p(slug, name, ord)
WHERE s.slug = 'tecnici'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Prodotto
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM products
WHERE slug = 'amtrust-ingegno-protetto'
  AND insurer_id = (SELECT id FROM insurers WHERE slug = 'amtrust');

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id,
  'amtrust-ingegno-protetto',
  'AmTrust Ingegno Protetto',
  'RC Professionale per professionisti tecnici – Linea Professione Protetta (bozza)',
  'bozza', true
FROM insurers i, sectors s
WHERE i.slug = 'amtrust' AND s.slug = 'tecnici';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Sector questions
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sector_questions
  (sector_id, key, label, type, options, validation, position, is_required, visible_if)
SELECT s.id, q.key, q.label, q.type, q.opts::jsonb, q.valid::jsonb, q.pos, q.req, q.vis::jsonb
FROM sectors s,
(VALUES
  -- FASE B (obbligatorie)
  ('q_fatturato',
   'Fascia di fatturato annuo',
   'dropdown',
   '[{"value":"fino_15k","label":"Fino a €15.000"},{"value":"15k_30k","label":"€15.001 – €30.000"},{"value":"30k_50k","label":"€30.001 – €50.000"},{"value":"50k_75k","label":"€50.001 – €75.000"},{"value":"75k_100k","label":"€75.001 – €100.000"},{"value":"100k_150k","label":"€100.001 – €150.000"},{"value":"150k_200k","label":"€150.001 – €200.000"},{"value":"200k_250k","label":"€200.001 – €250.000"},{"value":"250k_300k","label":"€250.001 – €300.000"},{"value":"300k_350k","label":"€300.001 – €350.000"},{"value":"350k_400k","label":"€350.001 – €400.000"},{"value":"400k_500k","label":"€400.001 – €500.000"},{"value":"oltre_500k","label":"Oltre €500.001"}]',
   NULL, 1, true, NULL),
  ('q_sinistri_5_anni',
   'Sinistri negli ultimi 5 anni',
   'number',
   NULL,
   '{"min":0,"max":10,"step":1}', 2, true, NULL),
  -- FASE C (opzionali – raffinamento)
  ('q_massimale_rc',
   'Massimale RC desiderato',
   'dropdown',
   '[{"value":250000,"label":"€250.000"},{"value":500000,"label":"€500.000"},{"value":1000000,"label":"€1.000.000"},{"value":1500000,"label":"€1.500.000"},{"value":2000000,"label":"€2.000.000"},{"value":2500000,"label":"€2.500.000"},{"value":3000000,"label":"€3.000.000"},{"value":4000000,"label":"€4.000.000"}]',
   NULL, 3, false, NULL),
  ('q_retroattivita',
   'Retroattività desiderata',
   'dropdown',
   '[{"value":"illimitata","label":"Illimitata"},{"value":"10_anni","label":"10 anni"}]',
   NULL, 4, false, NULL),
  ('q_anni_iscrizione_albo',
   'Anni di iscrizione all''albo professionale',
   'number',
   NULL,
   '{"min":0,"max":50,"step":1}', 5, false, NULL),
  ('q_franchigia',
   'Opzione franchigia',
   'dropdown',
   '[{"value":"standard","label":"Standard (franchigia base)"},{"value":"dimezzata","label":"Dimezzamento franchigia (+10%)"},{"value":"raddoppiata","label":"Raddoppio franchigia (-10%)"}]',
   NULL, 6, false,
   '{"op":"equals","key":"q_sinistri_5_anni","value":0}')
) AS q(key, label, type, opts, valid, pos, req, vis)
WHERE s.slug = 'tecnici'
ON CONFLICT (sector_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Coverage
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id,
  'rc_professionale',
  'RC Professionale',
  true,
  '["q_professione","q_fatturato","q_massimale_rc","q_retroattivita"]'::jsonb
FROM products p WHERE p.slug = 'amtrust-ingegno-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Eligibility rules
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.prio
FROM products p
CROSS JOIN (VALUES
  ('Massimale 3M o 4M – Riservato Direzione',
   '{"op":"greater_than_or_equal","key":"q_massimale_rc","value":3000000}',
   'manual_quote',
   'Per massimali €3.000.000 e €4.000.000 la quotazione è riservata alla Direzione AmTrust',
   10),
  ('Fatturato oltre €500.001 – Riservato Direzione',
   '{"op":"equals","key":"q_fatturato","value":"oltre_500k"}',
   'manual_quote',
   'Per fatturati superiori a €500.000 la quotazione è riservata alla Direzione AmTrust',
   20),
  ('Più di 2 sinistri – Riservato Direzione',
   '{"op":"greater_than","key":"q_sinistri_5_anni","value":2}',
   'manual_quote',
   'Più di 2 sinistri negli ultimi 5 anni: quotazione riservata alla Direzione AmTrust',
   30)
) AS r(name, cond, action, reason, prio)
WHERE p.slug = 'amtrust-ingegno-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Multipliers
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, NULL, m.name, m.factor, m.cond::jsonb, m.prio
FROM products p
CROSS JOIN (VALUES
  -- Sinistri (non si combinano con franchigia)
  ('1 sinistro pregresso (+10%)',  1.10,
   '{"op":"equals","key":"q_sinistri_5_anni","value":1}', 10),
  ('2 sinistri pregressi (+20%)',  1.20,
   '{"op":"equals","key":"q_sinistri_5_anni","value":2}', 11),
  -- Franchigia (solo con sinistri = 0, già filtrata da visible_if)
  ('Dimezzamento franchigia (+10%)', 1.10,
   '{"all":[{"op":"equals","key":"q_franchigia","value":"dimezzata"},{"op":"equals","key":"q_sinistri_5_anni","value":0}]}', 20),
  ('Raddoppio franchigia (-10%)',   0.90,
   '{"all":[{"op":"equals","key":"q_franchigia","value":"raddoppiata"},{"op":"equals","key":"q_sinistri_5_anni","value":0}]}', 21),
  -- Sconto anni iscrizione albo (0-9 anni; dal 10° in poi nessuno sconto)
  ('Iscrizione albo 0 anni (-40%)', 0.60, '{"op":"equals","key":"q_anni_iscrizione_albo","value":0}',  30),
  ('Iscrizione albo 1 anno (-40%)', 0.60, '{"op":"equals","key":"q_anni_iscrizione_albo","value":1}',  31),
  ('Iscrizione albo 2 anni (-30%)', 0.70, '{"op":"equals","key":"q_anni_iscrizione_albo","value":2}',  32),
  ('Iscrizione albo 3 anni (-20%)', 0.80, '{"op":"equals","key":"q_anni_iscrizione_albo","value":3}',  33),
  ('Iscrizione albo 4 anni (-15%)', 0.85, '{"op":"equals","key":"q_anni_iscrizione_albo","value":4}',  34),
  ('Iscrizione albo 5 anni (-10%)', 0.90, '{"op":"equals","key":"q_anni_iscrizione_albo","value":5}',  35),
  ('Iscrizione albo 6 anni (-8%)',  0.92, '{"op":"equals","key":"q_anni_iscrizione_albo","value":6}',  36),
  ('Iscrizione albo 7 anni (-6%)',  0.94, '{"op":"equals","key":"q_anni_iscrizione_albo","value":7}',  37),
  ('Iscrizione albo 8 anni (-4%)',  0.96, '{"op":"equals","key":"q_anni_iscrizione_albo","value":8}',  38),
  ('Iscrizione albo 9 anni (-2%)',  0.98, '{"op":"equals","key":"q_anni_iscrizione_albo","value":9}',  39)
) AS m(name, factor, cond, prio)
WHERE p.slug = 'amtrust-ingegno-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Addon questions + addons flat (DPO e Cyber Liability)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, position, section, is_required, phase)
SELECT p.id, q.key, q.label, q.help, 'dropdown', q.opts::jsonb, q.pos,
  'Garanzie Aggiuntive', false, 'addon'
FROM products p
CROSS JOIN (VALUES
  ('q_addon_dpo',
   'Aggiungere la copertura Data Protection Officer (DPO)?',
   'Premio fisso: €187. Copre la responsabilità derivante dal ruolo di DPO ai sensi del GDPR.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì (+€187)"}]',
   1),
  ('q_addon_cyber',
   'Aggiungere la copertura Cyber Liability?',
   'Premio fisso: €185. Copre la responsabilità civile derivante da violazioni della sicurezza informatica.',
   '[{"value":"no","label":"No"},{"value":"si","label":"Sì (+€185)"}]',
   2)
) AS q(key, label, help, opts, pos)
WHERE p.slug = 'amtrust-ingegno-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

INSERT INTO product_addons
  (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions)
SELECT p.id, a.key, a.name, 'flat', a.premium, a.trigger::jsonb, NULL, NULL
FROM products p
CROSS JOIN (VALUES
  ('dpo',
   'Data Protection Officer (DPO)',
   187.00,
   '{"op":"equals","key":"q_addon_dpo","value":"si"}'),
  ('cyber_liability',
   'Cyber Liability',
   185.00,
   '{"op":"equals","key":"q_addon_cyber","value":"si"}')
) AS a(key, name, premium, trigger)
WHERE p.slug = 'amtrust-ingegno-protetto';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Rate rows – prezzi reali
--
-- Architetto e Ingegnere hanno tariffe IDENTICHE → CROSS JOIN con professions.
-- Geometra, Perito Industriale, Agronomo hanno tariffe proprie.
--
-- Celle RD intermedie (non coperte da eligibility_rules):
--   • 250k massimale, fasce 100k_150k → 400k_500k (7 fasce)
--   • 500k massimale, fasce 300k_350k → 400k_500k (3 fasce)
--   • 1M massimale, fascia 400k_500k (1 fascia)
-- → inserite con premium=NULL, manual_quote=true in blocco separato.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ARCHITETTO + INGEGNERE (tariffe identiche) ────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_fatturato', r.fatt,
                          'q_massimale_rc', r.mass, 'q_retroattivita', r.retro),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES ('architetto'), ('ingegnere')) AS prof(slug)
CROSS JOIN (VALUES
  -- ── Retro Illimitata ──────────────────────────────────────────────────────
  ('fino_15k', 250000,'illimitata', 254.00), ('fino_15k', 500000,'illimitata', 314.00),
  ('fino_15k',1000000,'illimitata', 480.00), ('fino_15k',1500000,'illimitata', 502.00),
  ('fino_15k',2000000,'illimitata', 552.00), ('fino_15k',2500000,'illimitata', 607.00),
  ('15k_30k',  250000,'illimitata', 292.00), ('15k_30k',  500000,'illimitata', 326.00),
  ('15k_30k', 1000000,'illimitata', 519.00), ('15k_30k', 1500000,'illimitata', 563.00),
  ('15k_30k', 2000000,'illimitata', 619.00), ('15k_30k', 2500000,'illimitata', 681.00),
  ('30k_50k',  250000,'illimitata', 331.00), ('30k_50k',  500000,'illimitata', 446.00),
  ('30k_50k', 1000000,'illimitata', 607.00), ('30k_50k', 1500000,'illimitata', 717.00),
  ('30k_50k', 2000000,'illimitata', 789.00), ('30k_50k', 2500000,'illimitata', 868.00),
  ('50k_75k',  250000,'illimitata', 414.00), ('50k_75k',  500000,'illimitata', 524.00),
  ('50k_75k', 1000000,'illimitata', 733.00), ('50k_75k', 1500000,'illimitata', 872.00),
  ('50k_75k', 2000000,'illimitata', 959.00), ('50k_75k', 2500000,'illimitata',1055.00),
  ('75k_100k', 250000,'illimitata', 497.00), ('75k_100k', 500000,'illimitata', 595.00),
  ('75k_100k',1000000,'illimitata', 860.00), ('75k_100k',1500000,'illimitata', 992.00),
  ('75k_100k',2000000,'illimitata',1091.00), ('75k_100k',2500000,'illimitata',1200.00),
  ('100k_150k', 500000,'illimitata', 805.00), ('100k_150k',1000000,'illimitata',1323.00),
  ('100k_150k',1500000,'illimitata',1544.00), ('100k_150k',2000000,'illimitata',1698.00),
  ('100k_150k',2500000,'illimitata',1868.00),
  ('150k_200k', 500000,'illimitata',1433.00), ('150k_200k',1000000,'illimitata',1902.00),
  ('150k_200k',1500000,'illimitata',2095.00), ('150k_200k',2000000,'illimitata',2305.00),
  ('150k_200k',2500000,'illimitata',2536.00),
  ('200k_250k', 500000,'illimitata',1764.00), ('200k_250k',1000000,'illimitata',2393.00),
  ('200k_250k',1500000,'illimitata',2591.00), ('200k_250k',2000000,'illimitata',2850.00),
  ('200k_250k',2500000,'illimitata',3135.00),
  ('250k_300k', 500000,'illimitata',1908.00), ('250k_300k',1000000,'illimitata',2646.00),
  ('250k_300k',1500000,'illimitata',2889.00), ('250k_300k',2000000,'illimitata',3178.00),
  ('250k_300k',2500000,'illimitata',3496.00),
  ('300k_350k',1000000,'illimitata',3275.00), ('300k_350k',1500000,'illimitata',3650.00),
  ('300k_350k',2000000,'illimitata',4015.00), ('300k_350k',2500000,'illimitata',4417.00),
  ('350k_400k',1000000,'illimitata',3721.00), ('350k_400k',1500000,'illimitata',3959.00),
  ('350k_400k',2000000,'illimitata',4355.00), ('350k_400k',2500000,'illimitata',4791.00),
  ('400k_500k',1500000,'illimitata',4245.00), ('400k_500k',2000000,'illimitata',4670.00),
  ('400k_500k',2500000,'illimitata',5137.00),
  -- ── Retro 10 anni ─────────────────────────────────────────────────────────
  ('fino_15k', 250000,'10_anni', 240.00), ('fino_15k', 500000,'10_anni', 300.00),
  ('fino_15k',1000000,'10_anni', 455.00), ('fino_15k',1500000,'10_anni', 475.00),
  ('fino_15k',2000000,'10_anni', 525.00), ('fino_15k',2500000,'10_anni', 575.00),
  ('15k_30k',  250000,'10_anni', 275.00), ('15k_30k',  500000,'10_anni', 310.00),
  ('15k_30k', 1000000,'10_anni', 495.00), ('15k_30k', 1500000,'10_anni', 535.00),
  ('15k_30k', 2000000,'10_anni', 590.00), ('15k_30k', 2500000,'10_anni', 645.00),
  ('30k_50k',  250000,'10_anni', 315.00), ('30k_50k',  500000,'10_anni', 425.00),
  ('30k_50k', 1000000,'10_anni', 575.00), ('30k_50k', 1500000,'10_anni', 680.00),
  ('30k_50k', 2000000,'10_anni', 750.00), ('30k_50k', 2500000,'10_anni', 825.00),
  ('50k_75k',  250000,'10_anni', 395.00), ('50k_75k',  500000,'10_anni', 500.00),
  ('50k_75k', 1000000,'10_anni', 695.00), ('50k_75k', 1500000,'10_anni', 830.00),
  ('50k_75k', 2000000,'10_anni', 910.00), ('50k_75k', 2500000,'10_anni',1000.00),
  ('75k_100k', 250000,'10_anni', 470.00), ('75k_100k', 500000,'10_anni', 565.00),
  ('75k_100k',1000000,'10_anni', 815.00), ('75k_100k',1500000,'10_anni', 940.00),
  ('75k_100k',2000000,'10_anni',1035.00), ('75k_100k',2500000,'10_anni',1140.00),
  ('100k_150k', 500000,'10_anni', 765.00), ('100k_150k',1000000,'10_anni',1255.00),
  ('100k_150k',1500000,'10_anni',1465.00), ('100k_150k',2000000,'10_anni',1615.00),
  ('100k_150k',2500000,'10_anni',1775.00),
  ('150k_200k', 500000,'10_anni',1360.00), ('150k_200k',1000000,'10_anni',1805.00),
  ('150k_200k',1500000,'10_anni',1990.00), ('150k_200k',2000000,'10_anni',2190.00),
  ('150k_200k',2500000,'10_anni',2410.00),
  ('200k_250k', 500000,'10_anni',1675.00), ('200k_250k',1000000,'10_anni',2275.00),
  ('200k_250k',1500000,'10_anni',2460.00), ('200k_250k',2000000,'10_anni',2710.00),
  ('200k_250k',2500000,'10_anni',2980.00),
  ('250k_300k', 500000,'10_anni',1815.00), ('250k_300k',1000000,'10_anni',2515.00),
  ('250k_300k',1500000,'10_anni',2745.00), ('250k_300k',2000000,'10_anni',3020.00),
  ('250k_300k',2500000,'10_anni',3320.00),
  ('300k_350k',1000000,'10_anni',3110.00), ('300k_350k',1500000,'10_anni',3470.00),
  ('300k_350k',2000000,'10_anni',3815.00), ('300k_350k',2500000,'10_anni',4195.00),
  ('350k_400k',1000000,'10_anni',3535.00), ('350k_400k',1500000,'10_anni',3760.00),
  ('350k_400k',2000000,'10_anni',4135.00), ('350k_400k',2500000,'10_anni',4550.00),
  ('400k_500k',1500000,'10_anni',4035.00), ('400k_500k',2000000,'10_anni',4435.00),
  ('400k_500k',2500000,'10_anni',4880.00)
) AS r(fatt, mass, retro, premium)
WHERE cov.key = 'rc_professionale';

-- ── GEOMETRA ─────────────────────────────────────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione','geometra','q_fatturato',r.fatt,
                          'q_massimale_rc',r.mass,'q_retroattivita',r.retro),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES
  -- ── Retro Illimitata ──────────────────────────────────────────────────────
  ('fino_15k', 250000,'illimitata', 225.00), ('fino_15k', 500000,'illimitata', 261.00),
  ('fino_15k',1000000,'illimitata', 414.00), ('fino_15k',1500000,'illimitata', 450.00),
  ('fino_15k',2000000,'illimitata', 495.00), ('fino_15k',2500000,'illimitata', 545.00),
  ('15k_30k',  250000,'illimitata', 260.00), ('15k_30k',  500000,'illimitata', 290.00),
  ('15k_30k', 1000000,'illimitata', 460.00), ('15k_30k', 1500000,'illimitata', 495.00),
  ('15k_30k', 2000000,'illimitata', 545.00), ('15k_30k', 2500000,'illimitata', 600.00),
  ('30k_50k',  250000,'illimitata', 285.00), ('30k_50k',  500000,'illimitata', 395.00),
  ('30k_50k', 1000000,'illimitata', 545.00), ('30k_50k', 1500000,'illimitata', 630.00),
  ('30k_50k', 2000000,'illimitata', 693.00), ('30k_50k', 2500000,'illimitata', 762.00),
  ('50k_75k',  250000,'illimitata', 345.00), ('50k_75k',  500000,'illimitata', 430.00),
  ('50k_75k', 1000000,'illimitata', 630.00), ('50k_75k', 1500000,'illimitata', 710.00),
  ('50k_75k', 2000000,'illimitata', 781.00), ('50k_75k', 2500000,'illimitata', 859.00),
  ('75k_100k', 250000,'illimitata', 405.00), ('75k_100k', 500000,'illimitata', 467.00),
  ('75k_100k',1000000,'illimitata', 714.00), ('75k_100k',1500000,'illimitata', 860.00),
  ('75k_100k',2000000,'illimitata', 946.00), ('75k_100k',2500000,'illimitata',1041.00),
  ('100k_150k', 500000,'illimitata', 714.00), ('100k_150k',1000000,'illimitata', 985.00),
  ('100k_150k',1500000,'illimitata',1369.00), ('100k_150k',2000000,'illimitata',1506.00),
  ('100k_150k',2500000,'illimitata',1657.00),
  ('150k_200k', 500000,'illimitata', 965.00), ('150k_200k',1000000,'illimitata',1222.00),
  ('150k_200k',1500000,'illimitata',1654.00), ('150k_200k',2000000,'illimitata',1819.00),
  ('150k_200k',2500000,'illimitata',2001.00),
  ('200k_250k', 500000,'illimitata',1003.00), ('200k_250k',1000000,'illimitata',1507.00),
  ('200k_250k',1500000,'illimitata',1887.00), ('200k_250k',2000000,'illimitata',2076.00),
  ('200k_250k',2500000,'illimitata',2284.00),
  ('250k_300k', 500000,'illimitata',1380.00), ('250k_300k',1000000,'illimitata',1770.00),
  ('250k_300k',1500000,'illimitata',2120.00), ('250k_300k',2000000,'illimitata',2332.00),
  ('250k_300k',2500000,'illimitata',2565.00),
  ('300k_350k',1000000,'illimitata',1910.00), ('300k_350k',1500000,'illimitata',2260.00),
  ('300k_350k',2000000,'illimitata',2486.00), ('300k_350k',2500000,'illimitata',2735.00),
  ('350k_400k',1000000,'illimitata',2050.00), ('350k_400k',1500000,'illimitata',2395.00),
  ('350k_400k',2000000,'illimitata',2635.00), ('350k_400k',2500000,'illimitata',2899.00),
  ('400k_500k',1500000,'illimitata',2700.00), ('400k_500k',2000000,'illimitata',2970.00),
  ('400k_500k',2500000,'illimitata',3267.00),
  -- ── Retro 10 anni ─────────────────────────────────────────────────────────
  ('fino_15k', 250000,'10_anni', 215.00), ('fino_15k', 500000,'10_anni', 250.00),
  ('fino_15k',1000000,'10_anni', 395.00), ('fino_15k',1500000,'10_anni', 430.00),
  ('fino_15k',2000000,'10_anni', 470.00), ('fino_15k',2500000,'10_anni', 520.00),
  ('15k_30k',  250000,'10_anni', 245.00), ('15k_30k',  500000,'10_anni', 275.00),
  ('15k_30k', 1000000,'10_anni', 435.00), ('15k_30k', 1500000,'10_anni', 470.00),
  ('15k_30k', 2000000,'10_anni', 520.00), ('15k_30k', 2500000,'10_anni', 570.00),
  ('30k_50k',  250000,'10_anni', 270.00), ('30k_50k',  500000,'10_anni', 375.00),
  ('30k_50k', 1000000,'10_anni', 520.00), ('30k_50k', 1500000,'10_anni', 600.00),
  ('30k_50k', 2000000,'10_anni', 660.00), ('30k_50k', 2500000,'10_anni', 725.00),
  ('50k_75k',  250000,'10_anni', 330.00), ('50k_75k',  500000,'10_anni', 410.00),
  ('50k_75k', 1000000,'10_anni', 600.00), ('50k_75k', 1500000,'10_anni', 675.00),
  ('50k_75k', 2000000,'10_anni', 740.00), ('50k_75k', 2500000,'10_anni', 815.00),
  ('75k_100k', 250000,'10_anni', 385.00), ('75k_100k', 500000,'10_anni', 445.00),
  ('75k_100k',1000000,'10_anni', 680.00), ('75k_100k',1500000,'10_anni', 815.00),
  ('75k_100k',2000000,'10_anni', 900.00), ('75k_100k',2500000,'10_anni', 990.00),
  ('100k_150k', 500000,'10_anni', 680.00), ('100k_150k',1000000,'10_anni', 935.00),
  ('100k_150k',1500000,'10_anni',1300.00), ('100k_150k',2000000,'10_anni',1430.00),
  ('100k_150k',2500000,'10_anni',1575.00),
  ('150k_200k', 500000,'10_anni', 915.00), ('150k_200k',1000000,'10_anni',1160.00),
  ('150k_200k',1500000,'10_anni',1570.00), ('150k_200k',2000000,'10_anni',1730.00),
  ('150k_200k',2500000,'10_anni',1900.00),
  ('200k_250k', 500000,'10_anni', 955.00), ('200k_250k',1000000,'10_anni',1430.00),
  ('200k_250k',1500000,'10_anni',1795.00), ('200k_250k',2000000,'10_anni',1970.00),
  ('200k_250k',2500000,'10_anni',2170.00),
  ('250k_300k', 500000,'10_anni',1310.00), ('250k_300k',1000000,'10_anni',1680.00),
  ('250k_300k',1500000,'10_anni',2015.00), ('250k_300k',2000000,'10_anni',2215.00),
  ('250k_300k',2500000,'10_anni',2435.00),
  ('300k_350k',1000000,'10_anni',1815.00), ('300k_350k',1500000,'10_anni',2145.00),
  ('300k_350k',2000000,'10_anni',2360.00), ('300k_350k',2500000,'10_anni',2600.00),
  ('350k_400k',1000000,'10_anni',1950.00), ('350k_400k',1500000,'10_anni',2275.00),
  ('350k_400k',2000000,'10_anni',2505.00), ('350k_400k',2500000,'10_anni',2755.00),
  ('400k_500k',1500000,'10_anni',2565.00), ('400k_500k',2000000,'10_anni',2820.00),
  ('400k_500k',2500000,'10_anni',3105.00)
) AS r(fatt, mass, retro, premium)
WHERE cov.key = 'rc_professionale';

-- ── PERITO INDUSTRIALE ────────────────────────────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione','perito_industriale','q_fatturato',r.fatt,
                          'q_massimale_rc',r.mass,'q_retroattivita',r.retro),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES
  -- ── Retro Illimitata ──────────────────────────────────────────────────────
  ('fino_15k', 250000,'illimitata', 242.00), ('fino_15k', 500000,'illimitata', 299.00),
  ('fino_15k',1000000,'illimitata', 457.00), ('fino_15k',1500000,'illimitata', 478.00),
  ('fino_15k',2000000,'illimitata', 526.00), ('fino_15k',2500000,'illimitata', 579.00),
  ('15k_30k',  250000,'illimitata', 278.00), ('15k_30k',  500000,'illimitata', 310.00),
  ('15k_30k', 1000000,'illimitata', 494.00), ('15k_30k', 1500000,'illimitata', 536.00),
  ('15k_30k', 2000000,'illimitata', 590.00), ('15k_30k', 2500000,'illimitata', 649.00),
  ('30k_50k',  250000,'illimitata', 315.00), ('30k_50k',  500000,'illimitata', 425.00),
  ('30k_50k', 1000000,'illimitata', 578.00), ('30k_50k', 1500000,'illimitata', 683.00),
  ('30k_50k', 2000000,'illimitata', 751.00), ('30k_50k', 2500000,'illimitata', 826.00),
  ('50k_75k',  250000,'illimitata', 394.00), ('50k_75k',  500000,'illimitata', 499.00),
  ('50k_75k', 1000000,'illimitata', 698.00), ('50k_75k', 1500000,'illimitata', 830.00),
  ('50k_75k', 2000000,'illimitata', 913.00), ('50k_75k', 2500000,'illimitata',1004.00),
  ('75k_100k', 250000,'illimitata', 473.00), ('75k_100k', 500000,'illimitata', 567.00),
  ('75k_100k',1000000,'illimitata', 819.00), ('75k_100k',1500000,'illimitata', 945.00),
  ('75k_100k',2000000,'illimitata',1040.00), ('75k_100k',2500000,'illimitata',1144.00),
  ('100k_150k', 500000,'illimitata', 767.00), ('100k_150k',1000000,'illimitata',1260.00),
  ('100k_150k',1500000,'illimitata',1470.00), ('100k_150k',2000000,'illimitata',1617.00),
  ('100k_150k',2500000,'illimitata',1779.00),
  ('150k_200k', 500000,'illimitata',1365.00), ('150k_200k',1000000,'illimitata',1811.00),
  ('150k_200k',1500000,'illimitata',1995.00), ('150k_200k',2000000,'illimitata',2195.00),
  ('150k_200k',2500000,'illimitata',2415.00),
  ('200k_250k', 500000,'illimitata',1680.00), ('200k_250k',1000000,'illimitata',2279.00),
  ('200k_250k',1500000,'illimitata',2468.00), ('200k_250k',2000000,'illimitata',2715.00),
  ('200k_250k',2500000,'illimitata',2987.00),
  ('250k_300k', 500000,'illimitata',1817.00), ('250k_300k',1000000,'illimitata',2520.00),
  ('250k_300k',1500000,'illimitata',2751.00), ('250k_300k',2000000,'illimitata',3026.00),
  ('250k_300k',2500000,'illimitata',3329.00),
  ('300k_350k',1000000,'illimitata',3119.00), ('300k_350k',1500000,'illimitata',3476.00),
  ('300k_350k',2000000,'illimitata',3824.00), ('300k_350k',2500000,'illimitata',4206.00),
  ('350k_400k',1000000,'illimitata',3544.00), ('350k_400k',1500000,'illimitata',3770.00),
  ('350k_400k',2000000,'illimitata',4147.00), ('350k_400k',2500000,'illimitata',4562.00),
  ('400k_500k',1500000,'illimitata',4043.00), ('400k_500k',2000000,'illimitata',4447.00),
  ('400k_500k',2500000,'illimitata',4892.00),
  -- ── Retro 10 anni ─────────────────────────────────────────────────────────
  ('fino_15k', 250000,'10_anni', 230.00), ('fino_15k', 500000,'10_anni', 285.00),
  ('fino_15k',1000000,'10_anni', 435.00), ('fino_15k',1500000,'10_anni', 455.00),
  ('fino_15k',2000000,'10_anni', 500.00), ('fino_15k',2500000,'10_anni', 550.00),
  ('15k_30k',  250000,'10_anni', 265.00), ('15k_30k',  500000,'10_anni', 295.00),
  ('15k_30k', 1000000,'10_anni', 470.00), ('15k_30k', 1500000,'10_anni', 510.00),
  ('15k_30k', 2000000,'10_anni', 560.00), ('15k_30k', 2500000,'10_anni', 615.00),
  ('30k_50k',  250000,'10_anni', 300.00), ('30k_50k',  500000,'10_anni', 405.00),
  ('30k_50k', 1000000,'10_anni', 550.00), ('30k_50k', 1500000,'10_anni', 650.00),
  ('30k_50k', 2000000,'10_anni', 715.00), ('30k_50k', 2500000,'10_anni', 785.00),
  ('50k_75k',  250000,'10_anni', 375.00), ('50k_75k',  500000,'10_anni', 475.00),
  ('50k_75k', 1000000,'10_anni', 665.00), ('50k_75k', 1500000,'10_anni', 790.00),
  ('50k_75k', 2000000,'10_anni', 865.00), ('50k_75k', 2500000,'10_anni', 955.00),
  ('75k_100k', 250000,'10_anni', 450.00), ('75k_100k', 500000,'10_anni', 540.00),
  ('75k_100k',1000000,'10_anni', 780.00), ('75k_100k',1500000,'10_anni', 900.00),
  ('75k_100k',2000000,'10_anni', 990.00), ('75k_100k',2500000,'10_anni',1085.00),
  ('100k_150k', 500000,'10_anni', 730.00), ('100k_150k',1000000,'10_anni',1195.00),
  ('100k_150k',1500000,'10_anni',1395.00), ('100k_150k',2000000,'10_anni',1535.00),
  ('100k_150k',2500000,'10_anni',1690.00),
  ('150k_200k', 500000,'10_anni',1295.00), ('150k_200k',1000000,'10_anni',1720.00),
  ('150k_200k',1500000,'10_anni',1895.00), ('150k_200k',2000000,'10_anni',2085.00),
  ('150k_200k',2500000,'10_anni',2295.00),
  ('200k_250k', 500000,'10_anni',1595.00), ('200k_250k',1000000,'10_anni',2165.00),
  ('200k_250k',1500000,'10_anni',2345.00), ('200k_250k',2000000,'10_anni',2580.00),
  ('200k_250k',2500000,'10_anni',2840.00),
  ('250k_300k', 500000,'10_anni',1725.00), ('250k_300k',1000000,'10_anni',2395.00),
  ('250k_300k',1500000,'10_anni',2615.00), ('250k_300k',2000000,'10_anni',2875.00),
  ('250k_300k',2500000,'10_anni',3165.00),
  ('300k_350k',1000000,'10_anni',2965.00), ('300k_350k',1500000,'10_anni',3300.00),
  ('300k_350k',2000000,'10_anni',3635.00), ('300k_350k',2500000,'10_anni',3995.00),
  ('350k_400k',1000000,'10_anni',3365.00), ('350k_400k',1500000,'10_anni',3580.00),
  ('350k_400k',2000000,'10_anni',3940.00), ('350k_400k',2500000,'10_anni',4335.00),
  ('400k_500k',1500000,'10_anni',3840.00), ('400k_500k',2000000,'10_anni',4225.00),
  ('400k_500k',2500000,'10_anni',4645.00)
) AS r(fatt, mass, retro, premium)
WHERE cov.key = 'rc_professionale';

-- ── AGRONOMO – Retro Illimitata (stessa struttura degli altri) ────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione','agronomo','q_fatturato',r.fatt,
                          'q_massimale_rc',r.mass,'q_retroattivita','illimitata'),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES
  ('fino_15k', 250000, 230.00), ('fino_15k', 500000, 285.00),
  ('fino_15k',1000000, 435.00), ('fino_15k',1500000, 455.00),
  ('fino_15k',2000000, 501.00), ('fino_15k',2500000, 551.00),
  ('15k_30k',  250000, 265.00), ('15k_30k',  500000, 295.00),
  ('15k_30k', 1000000, 470.00), ('15k_30k', 1500000, 510.00),
  ('15k_30k', 2000000, 561.00), ('15k_30k', 2500000, 617.00),
  ('30k_50k',  250000, 300.00), ('30k_50k',  500000, 405.00),
  ('30k_50k', 1000000, 550.00), ('30k_50k', 1500000, 650.00),
  ('30k_50k', 2000000, 715.00), ('30k_50k', 2500000, 787.00),
  ('50k_75k',  250000, 375.00), ('50k_75k',  500000, 475.00),
  ('50k_75k', 1000000, 665.00), ('50k_75k', 1500000, 790.00),
  ('50k_75k', 2000000, 869.00), ('50k_75k', 2500000, 956.00),
  ('75k_100k', 250000, 450.00), ('75k_100k', 500000, 540.00),
  ('75k_100k',1000000, 780.00), ('75k_100k',1500000, 900.00),
  ('75k_100k',2000000, 990.00), ('75k_100k',2500000,1089.00),
  ('100k_150k', 500000, 730.00), ('100k_150k',1000000,1200.00),
  ('100k_150k',1500000,1400.00), ('100k_150k',2000000,1540.00),
  ('100k_150k',2500000,1694.00),
  ('150k_200k', 500000,1300.00), ('150k_200k',1000000,1725.00),
  ('150k_200k',1500000,1900.00), ('150k_200k',2000000,2090.00),
  ('150k_200k',2500000,2299.00),
  ('200k_250k', 500000,1600.00), ('200k_250k',1000000,2170.00),
  ('200k_250k',1500000,2350.00), ('200k_250k',2000000,2585.00),
  ('200k_250k',2500000,2844.00),
  ('250k_300k', 500000,1730.00), ('250k_300k',1000000,2400.00),
  ('250k_300k',1500000,2620.00), ('250k_300k',2000000,2882.00),
  ('250k_300k',2500000,3170.00),
  ('300k_350k',1000000,2970.00), ('300k_350k',1500000,3310.00),
  ('300k_350k',2000000,3641.00), ('300k_350k',2500000,4005.00),
  ('350k_400k',1000000,3375.00), ('350k_400k',1500000,3590.00),
  ('350k_400k',2000000,3949.00), ('350k_400k',2500000,4344.00),
  ('400k_500k',1500000,3850.00), ('400k_500k',2000000,4235.00),
  ('400k_500k',2500000,4659.00)
) AS r(fatt, mass, premium)
WHERE cov.key = 'rc_professionale';

-- ── AGRONOMO – Retro 10 anni (struttura diversa: 250k ha 12 fasce reali) ─────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione','agronomo','q_fatturato',r.fatt,
                          'q_massimale_rc',r.mass,'q_retroattivita','10_anni'),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES
  ('fino_15k', 250000, 220.00), ('fino_15k', 500000, 270.00),
  ('fino_15k',1000000, 415.00), ('fino_15k',1500000, 430.00),
  ('fino_15k',2000000, 475.00), ('fino_15k',2500000, 525.00),
  ('15k_30k',  250000, 250.00), ('15k_30k',  500000, 280.00),
  ('15k_30k', 1000000, 445.00), ('15k_30k', 1500000, 485.00),
  ('15k_30k', 2000000, 535.00), ('15k_30k', 2500000, 585.00),
  ('30k_50k',  250000, 285.00), ('30k_50k',  500000, 385.00),
  ('30k_50k', 1000000, 525.00), ('30k_50k', 1500000, 620.00),
  ('30k_50k', 2000000, 680.00), ('30k_50k', 2500000, 750.00),
  ('50k_75k',  250000, 355.00), ('50k_75k',  500000, 450.00),
  ('50k_75k', 1000000, 630.00), ('50k_75k', 1500000, 750.00),
  ('50k_75k', 2000000, 825.00), ('50k_75k', 2500000, 910.00),
  ('75k_100k', 250000, 430.00), ('75k_100k', 500000, 515.00),
  ('75k_100k',1000000, 740.00), ('75k_100k',1500000, 855.00),
  ('75k_100k',2000000, 940.00), ('75k_100k',2500000,1035.00),
  -- da 100k in poi: anche 250k ha valore reale (a differenza degli altri)
  ('100k_150k', 250000, 535.00), ('100k_150k', 500000, 695.00),
  ('100k_150k',1000000,1140.00), ('100k_150k',1500000,1330.00),
  ('100k_150k',2000000,1465.00), ('100k_150k',2500000,1610.00),
  ('150k_200k', 250000, 900.00), ('150k_200k', 500000,1235.00),
  ('150k_200k',1000000,1640.00), ('150k_200k',1500000,1805.00),
  ('150k_200k',2000000,1985.00), ('150k_200k',2500000,2185.00),
  ('200k_250k', 250000,1030.00), ('200k_250k', 500000,1520.00),
  ('200k_250k',1000000,2060.00), ('200k_250k',1500000,2235.00),
  ('200k_250k',2000000,2455.00), ('200k_250k',2500000,2700.00),
  ('250k_300k', 250000,1190.00), ('250k_300k', 500000,1645.00),
  ('250k_300k',1000000,2280.00), ('250k_300k',1500000,2490.00),
  ('250k_300k',2000000,2740.00), ('250k_300k',2500000,3010.00),
  ('300k_350k', 250000,1370.00), ('300k_350k', 500000,1890.00),
  ('300k_350k',1000000,2820.00), ('300k_350k',1500000,3145.00),
  ('300k_350k',2000000,3460.00), ('300k_350k',2500000,3805.00),
  ('350k_400k', 250000,1570.00), ('350k_400k', 500000,2175.00),
  ('350k_400k',1000000,3205.00), ('350k_400k',1500000,3410.00),
  ('350k_400k',2000000,3750.00), ('350k_400k',2500000,4125.00),
  ('400k_500k', 250000,1810.00), ('400k_500k', 500000,2505.00),
  ('400k_500k',1000000,3645.00), ('400k_500k',1500000,3660.00),
  ('400k_500k',2000000,4025.00), ('400k_500k',2500000,4425.00)
) AS r(fatt, mass, premium)
WHERE cov.key = 'rc_professionale';

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Rate rows – celle RD intermedie (manual_quote=true)
--
-- Per Architetto, Ingegnere, Geometra, Perito, Agronomo retro_illimitata:
--   • 250k massimale, fasce 100k_150k → 400k_500k (7 fasce)
--   • 500k massimale, fasce 300k_350k → 400k_500k (3 fasce)
--   • 1M massimale, fascia 400k_500k (1 fascia)
--
-- Per Agronomo retro_10anni: NESSUNA cella RD intermedia (tutte reali).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_fatturato', r.fatt,
                          'q_massimale_rc', r.mass, 'q_retroattivita', r.retro),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (
  -- Architetto, Ingegnere, Geometra, Perito: RD intermedie per entrambe le retro
  SELECT slug FROM (VALUES ('architetto'),('ingegnere'),('geometra'),('perito_industriale')) AS t(slug)
) AS prof
CROSS JOIN (VALUES
  -- 250k massimale, fasce alte (7 fasce × 2 retro)
  ('100k_150k', 250000, 'illimitata'), ('100k_150k', 250000, '10_anni'),
  ('150k_200k', 250000, 'illimitata'), ('150k_200k', 250000, '10_anni'),
  ('200k_250k', 250000, 'illimitata'), ('200k_250k', 250000, '10_anni'),
  ('250k_300k', 250000, 'illimitata'), ('250k_300k', 250000, '10_anni'),
  ('300k_350k', 250000, 'illimitata'), ('300k_350k', 250000, '10_anni'),
  ('350k_400k', 250000, 'illimitata'), ('350k_400k', 250000, '10_anni'),
  ('400k_500k', 250000, 'illimitata'), ('400k_500k', 250000, '10_anni'),
  -- 500k massimale, fasce 300k+ (3 fasce × 2 retro)
  ('300k_350k', 500000, 'illimitata'), ('300k_350k', 500000, '10_anni'),
  ('350k_400k', 500000, 'illimitata'), ('350k_400k', 500000, '10_anni'),
  ('400k_500k', 500000, 'illimitata'), ('400k_500k', 500000, '10_anni'),
  -- 1M massimale, fascia 400k_500k (1 fascia × 2 retro)
  ('400k_500k',1000000, 'illimitata'), ('400k_500k',1000000, '10_anni')
) AS r(fatt, mass, retro)
WHERE cov.key = 'rc_professionale';

-- Agronomo retro_illimitata: stesse RD intermedie degli altri (eccetto 100k_150k-400k_500k con 250k
-- che per agronomo retro_illimitata restano RD come per gli altri)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione','agronomo','q_fatturato',r.fatt,
                          'q_massimale_rc',r.mass,'q_retroattivita','illimitata'),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-ingegno-protetto'
CROSS JOIN (VALUES
  ('100k_150k', 250000), ('150k_200k', 250000), ('200k_250k', 250000),
  ('250k_300k', 250000), ('300k_350k', 250000), ('350k_400k', 250000),
  ('400k_500k', 250000),
  ('300k_350k', 500000), ('350k_400k', 500000), ('400k_500k', 500000),
  ('400k_500k',1000000)
) AS r(fatt, mass)
WHERE cov.key = 'rc_professionale';
