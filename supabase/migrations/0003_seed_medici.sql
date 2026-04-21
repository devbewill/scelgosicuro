-- =====================================================
-- Seed: settore Medici — 3 prodotti AmTrust reali
-- Medico Protetto (liberi prof.) + Colpagrave Extra (dipendenti) + Under 35
-- =====================================================

-- ─── Sector ───────────────────────────────────────────────────────────────────
INSERT INTO sectors (slug, name, description, display_order)
VALUES ('medici', 'Medici', 'RC Professionale per medici e specialisti sanitari', 1)
ON CONFLICT (slug) DO NOTHING;

-- ─── Professions ──────────────────────────────────────────────────────────────
INSERT INTO professions (sector_id, slug, name, display_order)
SELECT s.id, p.slug, p.name, p.ord
FROM sectors s,
(VALUES
  ('medico_generico',          'Medico di Medicina Generale (MMG)',          1),
  ('pediatra',                 'Pediatra',                                   2),
  ('specialista_ambulatoriale','Specialista Ambulatoriale',                  3),
  ('chirurgo',                 'Chirurgo',                                   4),
  ('specializzando',           'Specializzando',                             5)
) AS p(slug, name, ord)
WHERE s.slug = 'medici'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- ─── Insurer ──────────────────────────────────────────────────────────────────
INSERT INTO insurers (slug, name)
VALUES ('amtrust', 'AmTrust Europe')
ON CONFLICT (slug) DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────────────────────
INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id, p.slug, p.name, p.descr, '1.0', true
FROM insurers i, sectors s,
(VALUES
  ('amtrust-medico-protetto',
   'AmTrust Medico Protetto',
   'RC Professionale per medici liberi professionisti (anche SSN convenzionato)'),
  ('amtrust-colpa-grave-extra',
   'AmTrust Colpagrave Extra',
   'RC Colpa Grave per medici dipendenti SSN e strutture private. Tutela rivalsa ex Legge Gelli-Bianco.'),
  ('amtrust-medico-under-35',
   'AmTrust Medico Under 35',
   'RC Professionale entry-level per medici liberi professionisti fino a 35 anni')
) AS p(slug, name, descr)
WHERE i.slug = 'amtrust' AND s.slug = 'medici'
ON CONFLICT (insurer_id, slug, version) DO NOTHING;

-- ─── sector_questions (comuni a tutti e 3) ────────────────────────────────────
-- Ordine di visualizzazione nel form FASE B
INSERT INTO sector_questions (sector_id, key, label, help_text, type, options, position, is_required)
SELECT s.id, q.key, q.label, q.help_text, q.type, q.options::jsonb, q.pos, true
FROM sectors s,
(VALUES
  ('q_tipo_assicurato_medico',
   'Come eserciti la professione?',
   'Determina quale polizza è adatta a te.',
   'dropdown',
   '[{"value":"libero_professionista","label":"Libero professionista (anche SSN convenzionato)"},{"value":"dipendente","label":"Dipendente di struttura sanitaria (colpa grave)"}]',
   1),
  ('q_eta',
   'La tua età',
   null,
   'number',
   null,
   2),
  ('q_sinistri_5_anni',
   'Sinistri negli ultimi 5 anni',
   'Numero di sinistri denunciati negli ultimi 5 anni (0 se nessuno).',
   'number',
   null,
   3),
  ('q_massimale_rc',
   'Massimale di copertura desiderato',
   'Importo massimo rimborsabile per sinistro. Più alto il massimale, maggiore la protezione.',
   'dropdown',
   '[{"value":"1000000","label":"€1.000.000"},{"value":"2000000","label":"€2.000.000 (consigliato)"},{"value":"3000000","label":"€3.000.000"},{"value":"5000000","label":"€5.000.000"}]',
   4)
) AS q(key, label, help_text, type, options, pos)
WHERE s.slug = 'medici'
ON CONFLICT (sector_id, key) DO NOTHING;

-- ─── product_questions ────────────────────────────────────────────────────────

-- AmTrust Medico Protetto — domande specifiche per pricing
INSERT INTO product_questions (product_id, key, label, help_text, type, options, position, phase)
SELECT p.id, q.key, q.label, q.help_text, q.type, q.options::jsonb, q.pos, q.phase
FROM products p,
(VALUES
  ('q_gruppo_rischio_medico',
   'Specializzazione medica',
   'Il gruppo di rischio è determinato dalla tua specializzazione.',
   'dropdown',
   '[
     {"value":"gruppo_01","label":"Medicina Generale, Pediatria LSP, Geriatria"},
     {"value":"gruppo_02","label":"Audiologia, Genetica, Medicina Legale, Neuropsichiatria"},
     {"value":"gruppo_03","label":"Medicina Legale, Medicina del Lavoro"},
     {"value":"gruppo_04","label":"Neuropsichiatria, Psichiatria, Psicologia"},
     {"value":"gruppo_05","label":"Allergologia, Angiologia, Dietologia"},
     {"value":"gruppo_06","label":"Oculistica (non chirurgica), Dermatologia"},
     {"value":"gruppo_08","label":"Gastroenterologia, Medicina Interna, Endoscopia diagnostica"},
     {"value":"gruppo_10","label":"Pediatria (no neonatologia), Pneumologia"},
     {"value":"gruppo_17","label":"Cardiologia, Nefrologia, Reumatologia"}
   ]',
   1, 'pricing'),
  ('q_attivita_struttura',
   'Svolgi attività esclusivamente in struttura?',
   'Se operi solo all''interno di una struttura sanitaria si applica uno sconto del 15%.',
   'dropdown',
   '[{"value":"si","label":"Sì, solo in struttura"},{"value":"no","label":"No, anche in studio privato"}]',
   2, 'pricing'),
  ('q_franchigia_medico',
   'Aggiungere franchigia €2.500 (sconto -3%)?',
   'Si applica solo se non hai avuto sinistri negli ultimi 5 anni.',
   'dropdown',
   '[{"value":"0","label":"No franchigia"},{"value":"2500","label":"Sì — franchigia €2.500 (-3%)"}]',
   3, 'pricing')
) AS q(key, label, help_text, type, options, pos, phase)
WHERE p.slug = 'amtrust-medico-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- AmTrust Colpagrave Extra — domande specifiche per pricing
INSERT INTO product_questions (product_id, key, label, help_text, type, options, position, phase)
SELECT p.id, q.key, q.label, q.help_text, q.type, q.options::jsonb, q.pos, q.phase
FROM products p,
(VALUES
  ('q_categoria_rischio_cg',
   'Categoria di rischio (Colpa Grave)',
   'Basata sul tuo contratto e sulla presenza di Ginecologia/Ostetricia nella tua struttura.',
   'dropdown',
   '[
     {"value":"cod_01","label":"Cod. 01 – Dir. medico Pubblico con Ginecologia/Ostetricia"},
     {"value":"cod_02","label":"Cod. 02 – Dir. medico Pubblico senza Ginecologia/Ostetricia"},
     {"value":"cod_03","label":"Cod. 03 – Dir. medico Privato con Ginecologia/Ostetricia"},
     {"value":"cod_04","label":"Cod. 04 – Dir. medico Privato senza Ginecologia/Ostetricia"},
     {"value":"cod_05","label":"Cod. 05 – Specializzando"}
   ]',
   1, 'pricing'),
  ('q_retroattivita_rc',
   'Retroattività',
   'Periodo pregresso coperto dalla polizza (10 anni o illimitata).',
   'dropdown',
   '[{"value":"10_anni","label":"10 anni"},{"value":"illimitata","label":"Illimitata"}]',
   2, 'pricing')
) AS q(key, label, help_text, type, options, pos, phase)
WHERE p.slug = 'amtrust-colpa-grave-extra'
ON CONFLICT (product_id, key) DO NOTHING;

-- Under 35: nessuna product_question (usa solo q_eta già in sector_questions)

-- ─── product_eligibility_rules ────────────────────────────────────────────────

-- Medico Protetto: solo liberi professionisti
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.pri
FROM products p,
(VALUES
  ('Solo liberi professionisti',
   '{"key":"q_tipo_assicurato_medico","op":"equals","value":"dipendente"}',
   'exclude',
   'Solo per liberi professionisti. Per medici dipendenti è disponibile Colpagrave Extra.',
   1),
  ('Più di 2 sinistri — preventivo manuale',
   '{"key":"q_sinistri_5_anni","op":"greater_than","value":2}',
   'manual_quote',
   'Con più di 2 sinistri è necessario un preventivo personalizzato.',
   2)
) AS r(name, cond, action, reason, pri)
WHERE p.slug = 'amtrust-medico-protetto';

-- Under 35: solo liberi professionisti e under 35
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.pri
FROM products p,
(VALUES
  ('Solo liberi professionisti (Under 35)',
   '{"key":"q_tipo_assicurato_medico","op":"equals","value":"dipendente"}',
   'exclude',
   'Solo per liberi professionisti. Per medici dipendenti è disponibile Colpagrave Extra.',
   1),
  ('Solo medici under 35',
   '{"key":"q_eta","op":"greater_than","value":35}',
   'exclude',
   'Prodotto riservato a medici fino a 35 anni. Scegli Medico Protetto.',
   2),
  ('Più di 2 sinistri — preventivo manuale',
   '{"key":"q_sinistri_5_anni","op":"greater_than","value":2}',
   'manual_quote',
   'Con più di 2 sinistri è necessario un preventivo personalizzato.',
   3)
) AS r(name, cond, action, reason, pri)
WHERE p.slug = 'amtrust-medico-under-35';

-- Colpagrave Extra: solo dipendenti
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id,
  'Solo medici dipendenti',
  '{"key":"q_tipo_assicurato_medico","op":"equals","value":"libero_professionista"}'::jsonb,
  'exclude',
  'Solo per medici dipendenti di strutture sanitarie. Per liberi professionisti è disponibile Medico Protetto.',
  1
FROM products p
WHERE p.slug = 'amtrust-colpa-grave-extra';

-- ─── product_coverages ────────────────────────────────────────────────────────

-- Medico Protetto — coverage unica RC professionale
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions, position)
SELECT p.id, 'rc_professionale', 'RC Professionale', true,
  '["q_gruppo_rischio_medico","q_massimale_rc"]'::jsonb, 1
FROM products p WHERE p.slug = 'amtrust-medico-protetto';

-- Colpagrave Extra — coverage unica RC colpa grave
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions, position)
SELECT p.id, 'rc_colpa_grave', 'RC Colpa Grave', true,
  '["q_categoria_rischio_cg","q_massimale_rc","q_retroattivita_rc"]'::jsonb, 1
FROM products p WHERE p.slug = 'amtrust-colpa-grave-extra';

-- Under 35 — coverage unica prezzo fisso per fascia età
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions, position)
SELECT p.id, 'rc_under35', 'RC Professionale Under 35', true,
  '["q_eta"]'::jsonb, 1
FROM products p WHERE p.slug = 'amtrust-medico-under-35';

-- ─── product_rate_rows ────────────────────────────────────────────────────────

-- Medico Protetto: tabella gruppo_rischio × massimale (premi dal tariffario reale)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium)
SELECT c.id, r.dv::jsonb, r.premium
FROM product_coverages c
JOIN products p ON p.id = c.product_id
CROSS JOIN (VALUES
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_01"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 497),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_01"},{"key":"q_massimale_rc","op":"equals","value":"2000000"}]}', 572),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_01"},{"key":"q_massimale_rc","op":"equals","value":"3000000"}]}', 629),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_01"},{"key":"q_massimale_rc","op":"equals","value":"5000000"}]}', 673),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_02"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 519),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_02"},{"key":"q_massimale_rc","op":"equals","value":"2000000"}]}', 597),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_02"},{"key":"q_massimale_rc","op":"equals","value":"3000000"}]}', 657),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_02"},{"key":"q_massimale_rc","op":"equals","value":"5000000"}]}', 703),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_03"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 579),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_03"},{"key":"q_massimale_rc","op":"equals","value":"2000000"}]}', 666),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_03"},{"key":"q_massimale_rc","op":"equals","value":"3000000"}]}', 733),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_04"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 663),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_04"},{"key":"q_massimale_rc","op":"equals","value":"2000000"}]}', 762),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_05"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 718),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_06"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 774),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_08"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 820),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_10"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 890),
  ('{"all":[{"key":"q_gruppo_rischio_medico","op":"equals","value":"gruppo_17"},{"key":"q_massimale_rc","op":"equals","value":"1000000"}]}', 980)
) AS r(dv, premium)
WHERE p.slug = 'amtrust-medico-protetto' AND c.key = 'rc_professionale';

-- Colpagrave Extra: tabella completa categoria × massimale × retroattività (40 righe)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium)
SELECT c.id, r.dv::jsonb, r.premium
FROM product_coverages c
JOIN products p ON p.id = c.product_id
CROSS JOIN (VALUES
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    365),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    395),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    415),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    440),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 400),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 435),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 460),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_01"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 485),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    320),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    345),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    365),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    385),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 350),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 380),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 400),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_02"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 420),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    440),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    475),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    500),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    530),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 480),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 520),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 550),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_03"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 580),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    380),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    415),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    435),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    460),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 420),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 455),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 480),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_04"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 505),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    185),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    195),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    205),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}]}',    220),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"1000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 200),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"2000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 220),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"3000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 230),
  ('{"all":[{"key":"q_categoria_rischio_cg","op":"equals","value":"cod_05"},{"key":"q_massimale_rc","op":"equals","value":"5000000"},{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}]}', 240)
) AS r(dv, premium)
WHERE p.slug = 'amtrust-colpa-grave-extra' AND c.key = 'rc_colpa_grave';

-- Under 35: prezzo fisso per fascia età
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium)
SELECT c.id, r.dv::jsonb, r.premium
FROM product_coverages c
JOIN products p ON p.id = c.product_id
CROSS JOIN (VALUES
  ('{"key":"q_eta","op":"less_than","value":28}',                    300),
  ('{"all":[{"key":"q_eta","op":"greater_than_or_equal","value":28},{"key":"q_eta","op":"less_than_or_equal","value":35}]}', 340)
) AS r(dv, premium)
WHERE p.slug = 'amtrust-medico-under-35' AND c.key = 'rc_under35';

-- ─── product_multipliers ──────────────────────────────────────────────────────

-- Medico Protetto
INSERT INTO product_multipliers (product_id, name, factor, condition, priority)
SELECT p.id, m.name, m.factor, m.cond::jsonb, m.pri
FROM products p,
(VALUES
  ('Solo in struttura sanitaria', 0.85,
   '{"key":"q_attivita_struttura","op":"equals","value":"si"}', 1),
  ('Under 35', 0.93,
   '{"key":"q_eta","op":"less_than","value":35}', 2),
  ('35-40 anni', 0.95,
   '{"key":"q_eta","op":"between","value":[35,40]}', 3),
  ('Franchigia €2.500 + zero sinistri', 0.97,
   '{"all":[{"key":"q_franchigia_medico","op":"equals","value":"2500"},{"key":"q_sinistri_5_anni","op":"equals","value":0}]}', 4)
) AS m(name, factor, cond, pri)
WHERE p.slug = 'amtrust-medico-protetto';

-- Colpagrave Extra
INSERT INTO product_multipliers (product_id, name, factor, condition, priority)
SELECT p.id, m.name, m.factor, m.cond::jsonb, m.pri
FROM products p,
(VALUES
  ('Under 35', 0.90, '{"key":"q_eta","op":"less_than","value":35}', 1),
  ('Zero sinistri', 0.95, '{"key":"q_sinistri_5_anni","op":"equals","value":0}', 2)
) AS m(name, factor, cond, pri)
WHERE p.slug = 'amtrust-colpa-grave-extra';

-- Under 35: nessun moltiplicatore

-- ─── product_addons ───────────────────────────────────────────────────────────

-- Medico Protetto
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium)
SELECT p.id, a.key, a.name, 'flat', a.premium
FROM products p,
(VALUES
  ('ruolo_apicale',          'Perdite Patrimoniali – Ruolo apicale / Direzione sanitaria', 450),
  ('perdite_patrimoniali_rct','Perdite Patrimoniali + studio RCT/RCO',                     100),
  ('omesso_ecm',             'Omesso ECM',                                                  40)
) AS a(key, name, premium)
WHERE p.slug = 'amtrust-medico-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- Under 35
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium)
SELECT p.id, a.key, a.name, 'flat', a.premium
FROM products p,
(VALUES
  ('omesso_ecm',             'Omesso ECM',                       40),
  ('perdite_patrimoniali_rct','Perdite Patrimoniali studio RCT', 100)
) AS a(key, name, premium)
WHERE p.slug = 'amtrust-medico-under-35'
ON CONFLICT (product_id, key) DO NOTHING;

-- Colpagrave Extra (rate_table perché il prezzo dipende da q_retroattivita_rc)
INSERT INTO product_addons (product_id, key, name, pricing_mode, dimensions)
SELECT p.id, a.key, a.name, 'rate_table', '["q_retroattivita_rc"]'::jsonb
FROM products p,
(VALUES
  ('dip_pubblico_plus',          'Dipendente Pubblico Plus (€500k copertura aggiuntiva)'),
  ('ruolo_apicale_perdite',      'Perdite Patrimoniali – Ruolo apicale (€200k)'),
  ('altre_perdite_patrimoniali', 'Altre Perdite Patrimoniali (€200k)'),
  ('attivita_accessorie_rc',     'Attività accessorie RC (€1M)')
) AS a(key, name)
WHERE p.slug = 'amtrust-colpa-grave-extra'
ON CONFLICT (product_id, key) DO NOTHING;

-- Rate rows per gli addon Colpagrave Extra
INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium)
SELECT ad.id, r.dv::jsonb, r.premium
FROM product_addons ad
JOIN products p ON p.id = ad.product_id
CROSS JOIN (VALUES
  ('dip_pubblico_plus',
   '{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}', 400),
  ('dip_pubblico_plus',
   '{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}', 440),
  ('ruolo_apicale_perdite',
   '{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}', 450),
  ('ruolo_apicale_perdite',
   '{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}', 495),
  ('altre_perdite_patrimoniali',
   '{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}', 100),
  ('altre_perdite_patrimoniali',
   '{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}', 110),
  ('attivita_accessorie_rc',
   '{"key":"q_retroattivita_rc","op":"equals","value":"10_anni"}', 300),
  ('attivita_accessorie_rc',
   '{"key":"q_retroattivita_rc","op":"equals","value":"illimitata"}', 330)
) AS r(addon_key, dv, premium)
WHERE p.slug = 'amtrust-colpa-grave-extra' AND ad.key = r.addon_key;
