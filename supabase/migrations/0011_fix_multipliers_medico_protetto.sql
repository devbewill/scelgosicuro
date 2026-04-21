-- Migration 0011: resetta e riscrive i moltiplicatori di AmTrust Medico Protetto
-- Il DB aveva dati da una versione precedente (q_attivita_struttura="si", q_franchigia_medico)
-- che non corrispondevano alle sector_questions attuali.

DELETE FROM product_multipliers
WHERE product_id = (SELECT id FROM products WHERE slug = 'amtrust-medico-protetto');

INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, NULL, m.name, m.factor, m.cond::jsonb, m.prio
FROM products p
CROSS JOIN (VALUES
  ('Attività esclusivamente in struttura (-15%)',  0.85,
   '{"op":"equals","key":"q_attivita_struttura","value":"una_struttura"}', 10),
  ('Franchigia € 2.500 (-3%)',   0.97,
   '{"op":"equals","key":"q_franchigia","value":2500}',  20),
  ('Franchigia € 10.000 (-12%)', 0.88,
   '{"op":"equals","key":"q_franchigia","value":10000}', 21),
  ('Under 35 (-7%)',             0.93,
   '{"op":"less_than","key":"q_eta","value":35}',        30),
  ('Età 35-40 anni (-5%)',       0.95,
   '{"op":"between","key":"q_eta","value":[35,40]}',     31),
  ('1 sinistro pregresso (+15%)', 1.15,
   '{"op":"equals","key":"q_sinistri_5_anni","value":1}', 40),
  ('2 sinistri pregressi (+50%)', 1.50,
   '{"op":"equals","key":"q_sinistri_5_anni","value":2}', 41),
  ('Età 70 anni o più (+3%)',    1.03,
   '{"op":"greater_than_or_equal","key":"q_eta","value":70}', 50)
) AS m(name, factor, cond, prio)
WHERE p.slug = 'amtrust-medico-protetto';
