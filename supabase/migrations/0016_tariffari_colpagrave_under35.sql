-- Migration 0016: tariffari AmTrust Colpa Grave Extra e AmTrust Medico Under 35
--
-- Colpa Grave Extra (product slug: amtrust-colpa-grave-extra)
--   Target: medici dipendenti (pubblici SSN, privati, specializzandi)
--   Nuove dimensions: q_tipo_datore + q_con_ginecologia + q_massimale_rc + q_retroattivita
--   Nuove product_questions (phase=addon → FASE C): q_tipo_datore, q_con_ginecologia
--   48 rate_rows: 5 profili × 4 massimali × 2 retroattività
--     (specializzando: righe duplicate gin=si/no con stesso prezzo — base mode usa match parziale)
--
-- Medico Under 35 (product slug: amtrust-medico-under-35)
--   Target: liberi professionisti con età ≤ 35 anni
--   Nuove dimensions: q_eta (massimale fisso 2M, retro fissa 10a — non sono pricing dimensions)
--   18 rate_rows: una per ogni età da 18 a 35
--   Nuove eligibility_rules: esclude massimale != 2M e retroattività illimitata

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 1 — AmTrust Colpa Grave Extra
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. Aggiorna dimensions coverage rc_colpa_grave
UPDATE product_coverages
SET dimensions = '["q_tipo_datore","q_con_ginecologia","q_massimale_rc","q_retroattivita"]'::jsonb
WHERE key = 'rc_colpa_grave'
  AND product_id = (SELECT id FROM products WHERE slug = 'amtrust-colpa-grave-extra');

-- 1b. Nuove product_questions (FASE C — raffinamento pricing)
INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, validation,
   position, section, is_required, visible_if, phase)
SELECT p.id, q.key, q.label, q.help_text, q.type, q.opts::jsonb, NULL,
       q.pos, 'Profilo Dipendente', false, q.vis::jsonb, 'addon'
FROM products p
CROSS JOIN (VALUES
  ('q_tipo_datore',
   'Tipo di rapporto di lavoro',
   'Indica se sei dipendente di una struttura pubblica (SSN), privata, o stai svolgendo la scuola di specializzazione.',
   'dropdown',
   '[{"value":"dip_pub","label":"Dipendente SSN / struttura pubblica"},{"value":"dip_priv","label":"Dipendente struttura privata"},{"value":"specializzando","label":"Specializzando"}]',
   1,
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"dipendente"}'),
  ('q_con_ginecologia',
   'La tua attività include Ginecologia e Ostetricia?',
   'Specifica se la tua specializzazione comprende atti di Ginecologia e/o assistenza al parto.',
   'dropdown',
   '[{"value":"si","label":"Sì"},{"value":"no","label":"No"}]',
   2,
   '{"any":[{"op":"equals","key":"q_tipo_datore","value":"dip_pub"},{"op":"equals","key":"q_tipo_datore","value":"dip_priv"}]}')
) AS q(key, label, help_text, type, opts, pos, vis)
WHERE p.slug = 'amtrust-colpa-grave-extra'
ON CONFLICT DO NOTHING;

-- 1c. Rate rows — Colpa Grave Extra (48 righe)
-- Fonte: Tariffario AmTrust Colpagrave Extra Ed. 02/2023
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object(
         'q_tipo_datore',     r.tipo,
         'q_con_ginecologia', r.gino,
         'q_massimale_rc',    r.mass,
         'q_retroattivita',   r.retro
       ),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-colpa-grave-extra'
CROSS JOIN (VALUES
  -- ── RETRO 10 ANNI ──────────────────────────────────────────────────────────
  -- Cat.01: Dipendente Pubblico + Ginecologia/Ostetricia
  ('dip_pub', 'si', 1000000, '10_anni',  365.00),
  ('dip_pub', 'si', 2000000, '10_anni',  395.00),
  ('dip_pub', 'si', 3000000, '10_anni',  415.00),
  ('dip_pub', 'si', 5000000, '10_anni',  440.00),
  -- Cat.02: Dipendente Pubblico esclusa Ginecologia/Ostetricia
  ('dip_pub', 'no', 1000000, '10_anni',  320.00),
  ('dip_pub', 'no', 2000000, '10_anni',  345.00),
  ('dip_pub', 'no', 3000000, '10_anni',  365.00),
  ('dip_pub', 'no', 5000000, '10_anni',  385.00),
  -- Cat.03: Dipendente Privato + Ginecologia/Ostetricia
  ('dip_priv','si', 1000000, '10_anni',  440.00),
  ('dip_priv','si', 2000000, '10_anni',  475.00),
  ('dip_priv','si', 3000000, '10_anni',  500.00),
  ('dip_priv','si', 5000000, '10_anni',  530.00),
  -- Cat.04: Dipendente Privato esclusa Ginecologia/Ostetricia
  ('dip_priv','no', 1000000, '10_anni',  380.00),
  ('dip_priv','no', 2000000, '10_anni',  415.00),
  ('dip_priv','no', 3000000, '10_anni',  435.00),
  ('dip_priv','no', 5000000, '10_anni',  460.00),
  -- Cat.05: Specializzando — prezzo identico per gin=si e gin=no
  ('specializzando','si', 1000000, '10_anni', 185.00),
  ('specializzando','si', 2000000, '10_anni', 195.00),
  ('specializzando','si', 3000000, '10_anni', 205.00),
  ('specializzando','si', 5000000, '10_anni', 220.00),
  ('specializzando','no', 1000000, '10_anni', 185.00),
  ('specializzando','no', 2000000, '10_anni', 195.00),
  ('specializzando','no', 3000000, '10_anni', 205.00),
  ('specializzando','no', 5000000, '10_anni', 220.00),
  -- ── RETRO ILLIMITATA ───────────────────────────────────────────────────────
  -- Cat.01: Dipendente Pubblico + Ginecologia/Ostetricia
  ('dip_pub', 'si', 1000000, 'illimitata', 400.00),
  ('dip_pub', 'si', 2000000, 'illimitata', 435.00),
  ('dip_pub', 'si', 3000000, 'illimitata', 460.00),
  ('dip_pub', 'si', 5000000, 'illimitata', 485.00),
  -- Cat.02: Dipendente Pubblico esclusa Ginecologia/Ostetricia
  ('dip_pub', 'no', 1000000, 'illimitata', 350.00),
  ('dip_pub', 'no', 2000000, 'illimitata', 380.00),
  ('dip_pub', 'no', 3000000, 'illimitata', 400.00),
  ('dip_pub', 'no', 5000000, 'illimitata', 420.00),
  -- Cat.03: Dipendente Privato + Ginecologia/Ostetricia
  ('dip_priv','si', 1000000, 'illimitata', 480.00),
  ('dip_priv','si', 2000000, 'illimitata', 520.00),
  ('dip_priv','si', 3000000, 'illimitata', 550.00),
  ('dip_priv','si', 5000000, 'illimitata', 580.00),
  -- Cat.04: Dipendente Privato esclusa Ginecologia/Ostetricia
  ('dip_priv','no', 1000000, 'illimitata', 420.00),
  ('dip_priv','no', 2000000, 'illimitata', 455.00),
  ('dip_priv','no', 3000000, 'illimitata', 480.00),
  ('dip_priv','no', 5000000, 'illimitata', 505.00),
  -- Cat.05: Specializzando — prezzo identico per gin=si e gin=no
  ('specializzando','si', 1000000, 'illimitata', 200.00),
  ('specializzando','si', 2000000, 'illimitata', 220.00),
  ('specializzando','si', 3000000, 'illimitata', 230.00),
  ('specializzando','si', 5000000, 'illimitata', 240.00),
  ('specializzando','no', 1000000, 'illimitata', 200.00),
  ('specializzando','no', 2000000, 'illimitata', 220.00),
  ('specializzando','no', 3000000, 'illimitata', 230.00),
  ('specializzando','no', 5000000, 'illimitata', 240.00)
) AS r(tipo, gino, mass, retro, premium)
WHERE cov.key = 'rc_colpa_grave';

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 2 — AmTrust Medico Under 35
-- ─────────────────────────────────────────────────────────────────────────────

-- 2a. Aggiorna dimensions coverage rc_under35
-- Massimale (fisso 2M) e retroattività (fissa 10a) non variano il prezzo → non sono dimensions
-- Il prezzo dipende solo dall'età → q_eta è già in sector_questions (is_required=true)
UPDATE product_coverages
SET dimensions = '["q_eta"]'::jsonb
WHERE key = 'rc_under35'
  AND product_id = (SELECT id FROM products WHERE slug = 'amtrust-medico-under-35');

-- 2b. Eligibility rules aggiuntive
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, 'exclude', r.reason, r.prio
FROM products p
CROSS JOIN (VALUES
  ('Massimale fisso 2 milioni',
   '{"any":[{"op":"less_than","key":"q_massimale_rc","value":2000000},{"op":"greater_than","key":"q_massimale_rc","value":2000000}]}',
   'AmTrust Medico Under 35 è disponibile esclusivamente con massimale € 2.000.000',
   30),
  ('Solo retroattività 10 anni',
   '{"op":"equals","key":"q_retroattivita","value":"illimitata"}',
   'AmTrust Medico Under 35 è disponibile esclusivamente con retroattività 10 anni',
   40)
) AS r(name, cond, reason, prio)
WHERE p.slug = 'amtrust-medico-under-35';

-- 2c. Rate rows — Medico Under 35 (18 righe: una per ogni età da 18 a 35)
-- Fonte: Tariffario AmTrust MedicoUnder35 Ed. 02/2023
-- Età ≤ 28 → €300 | Età 29–35 → €340
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_eta', r.eta),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-medico-under-35'
CROSS JOIN (VALUES
  -- Età ≤ 28 → €300
  (18, 300.00), (19, 300.00), (20, 300.00), (21, 300.00), (22, 300.00),
  (23, 300.00), (24, 300.00), (25, 300.00), (26, 300.00), (27, 300.00),
  (28, 300.00),
  -- Età 29–35 → €340
  (29, 340.00), (30, 340.00), (31, 340.00), (32, 340.00),
  (33, 340.00), (34, 340.00), (35, 340.00)
) AS r(eta, premium)
WHERE cov.key = 'rc_under35';
