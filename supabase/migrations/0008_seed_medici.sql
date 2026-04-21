-- Migration 0008: seed completo settore medici + tariffario AmTrust Medico Protetto

-- =====================================================
-- Sector
-- =====================================================

INSERT INTO sectors (slug, name, description, display_order, is_active)
VALUES ('medici', 'Medici', 'RC Professionale per medici e specialisti sanitari', 1, true);

-- =====================================================
-- Professions (85 specializzazioni mediche)
-- =====================================================

INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, p.slug, p.name, p.ord, true
FROM sectors s,
(VALUES
  -- Medicina Generale / Base
  ('mmg',                          'Medico di Medicina Generale (MMG)',                              1),
  ('medico_comunita',              'Medico di Comunità (SSN)',                                       2),
  ('medico_abilitato',             'Medico Abilitato non Specialista',                               3),
  ('medicina_termale',             'Medicina Termale',                                               4),
  ('medicine_non_convenzionali',   'Medicine Non Convenzionali e Osteopatiche / Agopuntura',         5),
  -- Pediatria
  ('pediatra_libera_scelta',       'Pediatra di Libera Scelta (SSN)',                                10),
  ('pediatra_specialista',         'Pediatria Specialistica (senza neonatologia)',                   11),
  ('pediatra_neonatologia',        'Pediatria con Neonatologia e TIN',                              12),
  ('chirurgo_pediatrico',          'Chirurgia Pediatrica',                                           13),
  -- Medicina Specialistica Non Chirurgica
  ('allergologia',                 'Allergologia e Immunologia Clinica',                             20),
  ('angiologia',                   'Angiologia e Flebologia',                                        21),
  ('audiologia',                   'Audiologia e Foniatria',                                         22),
  ('cardiologia',                  'Cardiologia',                                                    23),
  ('dermatologia',                 'Dermatologia e Venereologia',                                    24),
  ('diabetologia',                 'Diabetologia e Malattie del Metabolismo',                        25),
  ('diagnostica_ecografica',       'Diagnostica Ecografica Internistica',                            26),
  ('ematologia',                   'Ematologia e Medicina Trasfusionale',                            27),
  ('endocrinologia',               'Endocrinologia e Malattie del Ricambio',                         28),
  ('epatologia',                   'Epatologia',                                                     29),
  ('farmacologia',                 'Farmacologia e Tossicologia Clinica',                            30),
  ('fisiatria',                    'Medicina Fisica e Riabilitativa (Fisiatria)',                    31),
  ('gastroenterologia',            'Gastroenterologia',                                              32),
  ('genetica_medica',              'Genetica Medica',                                                33),
  ('geriatria',                    'Geriatria',                                                      34),
  ('ginecologia',                  'Ginecologia e Ostetricia (non chirurgica)',                      35),
  ('igiene_medicina_preventiva',   'Igiene e Medicina Preventiva',                                   36),
  ('malattie_infettive',           'Malattie Infettive e Tropicali',                                 37),
  ('medicina_aeronautica',         'Medicina Aeronautica e Spaziale',                                38),
  ('medicina_del_lavoro',          'Medicina del Lavoro',                                            39),
  ('medicina_dello_sport',         'Medicina dello Sport',                                           40),
  ('medicina_emergenza',           'Medicina d''Emergenza-Urgenza',                                  41),
  ('medicina_interna',             'Medicina Interna',                                               42),
  ('medicina_legale',              'Medicina Legale',                                                43),
  ('medicina_nucleare',            'Medicina Nucleare',                                              44),
  ('microbiologia',                'Microbiologia e Virologia',                                      45),
  ('nefrologia',                   'Nefrologia',                                                     46),
  ('neurologia',                   'Neurologia',                                                     47),
  ('neuropsichiatria',             'Neuropsichiatria (anche Infantile)',                              48),
  ('neurofisiopatologia',          'Neurofisiopatologia',                                            49),
  ('oculistica',                   'Oculistica / Oftalmologia (ambulatoriale)',                      50),
  ('oncologia',                    'Oncologia e Senologia',                                          51),
  ('ortopedia',                    'Ortopedia (ambulatoriale, senza chirurgia)',                     52),
  ('otorinolaringoiatria',         'Otorinolaringoiatria (ambulatoriale)',                            53),
  ('patologia_clinica',            'Patologia Clinica e Biochimica Clinica',                         54),
  ('patologia',                    'Anatomia Patologica',                                            55),
  ('pneumologia',                  'Pneumologia',                                                    56),
  ('psichiatria',                  'Psichiatria',                                                    57),
  ('psicologia_clinica',           'Psicologia Clinica',                                             58),
  ('radiodiagnostica',             'Radiodiagnostica (esclusa mammografia)',                          59),
  ('radioterapia',                 'Radioterapia',                                                   60),
  ('reumatologia',                 'Reumatologia',                                                   61),
  ('scienze_alimentazione',        'Scienze dell''Alimentazione',                                    62),
  ('terapia_dolore',               'Terapia del Dolore e Cure Palliative',                           63),
  ('andrologia',                   'Andrologia',                                                     64),
  ('urologia',                     'Urologia',                                                       65),
  ('visite_preoperatorie',         'Visite Specialistiche Preparatorie a Chirurgia',                 66),
  ('statistica_sanitaria',         'Statistica Sanitaria e Biometria',                               67),
  -- Medicina Chirurgica
  ('anestesia_rianimazione',              'Anestesia, Rianimazione e Terapia Intensiva',             70),
  ('cardiochirurgia',                     'Cardiochirurgia',                                         71),
  ('cardiologia_interventistica',         'Cardiologia Interventistica',                             72),
  ('chirurgia_addominale',                'Chirurgia Addominale',                                    73),
  ('chirurgia_bariatrica',                'Chirurgia Bariatrica',                                    74),
  ('chirurgia_andrologica',               'Chirurgia Andrologica',                                   75),
  ('chirurgia_apparato_digerente',        'Chirurgia dell''Apparato Digerente',                      76),
  ('chirurgia_d_urgenza',                 'Chirurgia d''Urgenza',                                    77),
  ('chirurgia_estetica_plastica',         'Chirurgia Estetica Plastica',                             78),
  ('chirurgia_fetale',                    'Chirurgia Fetale',                                        79),
  ('chirurgia_generale',                  'Chirurgia Generale',                                      80),
  ('chirurgia_ginecologica',              'Chirurgia Ginecologica (esclusa ostetricia)',              81),
  ('chirurgia_mano',                      'Chirurgia della Mano',                                    82),
  ('chirurgia_maxillo_facciale',          'Chirurgia Maxillo Facciale (esclusa ch. estetica)',       83),
  ('chirurgia_maxillo_facciale_estetica', 'Chirurgia Maxillo Facciale (inclusa ch. estetica)',       84),
  ('chirurgia_oncologica_ortopedica',     'Chirurgia Oncologica Ortopedica',                         85),
  ('chirurgia_oncologica_senologica',     'Chirurgia Oncologica e Senologica',                       86),
  ('chirurgia_proctologica',              'Chirurgia Proctologica',                                  87),
  ('chirurgia_ricostruttiva',             'Chirurgia Ricostruttiva',                                 88),
  ('chirurgia_toracica',                  'Chirurgia Toracica',                                      89),
  ('chirurgia_urologica',                 'Chirurgia Urologica',                                     90),
  ('chirurgia_vascolare',                 'Chirurgia Vascolare',                                     91),
  ('endocrinochirurgia',                  'Endocrinochirurgia',                                      92),
  ('ginecologia_fecondazione',            'Ginecologia con Fecondazione Assistita',                  93),
  ('ginecologia_invasiva',                'Ginecologia con Atti Invasivi',                           94),
  ('ginecologia_ostetricia_parto',        'Ginecologia e Ostetricia con Assistenza al Parto',        95),
  ('nefrologia_chirurgica',               'Nefrologia Chirurgica',                                   96),
  ('oculistica_chirurgica',               'Oculistica Chirurgica (esclusa ch. estetica)',            97),
  ('oculistica_chirurgica_estetica',      'Oculistica Chirurgica (inclusa ch. estetica)',            98),
  ('ortopedia_traumatologia',             'Ortopedia con Traumatologia (esclusi interventi spinali)',99),
  ('ortopedia_spinale',                   'Ortopedia con Traumatologia (inclusi interventi spinali)',100),
  ('otorinolaringoiatria_chir',           'ORL Chirurgica (esclusa ch. estetica)',                   101),
  ('otorinolaringoiatria_chir_estetica',  'ORL Chirurgica (inclusa ch. estetica)',                   102),
  ('neurochirurgia',                      'Neurochirurgia',                                          103)
) AS p(slug, name, ord)
WHERE s.slug = 'medici';

-- =====================================================
-- Insurer
-- =====================================================

INSERT INTO insurers (slug, name, is_active)
VALUES ('amtrust', 'AmTrust Europe', true);

-- =====================================================
-- Products
-- =====================================================

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id, p.slug, p.name, p.descr, '1.0', true
FROM insurers i, sectors s,
(VALUES
  ('amtrust-medico-protetto',
   'AmTrust Medico Protetto',
   'RC Professionale per medici liberi professionisti. Tariffario Ed. 06/2024.'),
  ('amtrust-colpa-grave-extra',
   'AmTrust Colpagrave Extra',
   'RC Colpa Grave per medici dipendenti SSN e strutture private. Legge Gelli-Bianco.'),
  ('amtrust-medico-under-35',
   'AmTrust Medico Under 35',
   'RC Professionale entry-level per medici liberi professionisti fino a 35 anni.')
) AS p(slug, name, descr)
WHERE i.slug = 'amtrust' AND s.slug = 'medici';

-- =====================================================
-- Sector questions
-- =====================================================

INSERT INTO sector_questions
  (sector_id, key, label, type, options, position, is_required, is_mandatory)
SELECT s.id, q.key, q.label, q.type, q.opts::jsonb, q.pos, true, q.mandatory
FROM sectors s,
(VALUES
  ('q_tipo_assicurato_medico',
   'Tipo di attività',
   'dropdown',
   '[{"value":"libero_prof","label":"Libero professionista"},{"value":"dipendente","label":"Dipendente SSN / struttura privata"}]',
   1, true),
  ('q_sinistri_5_anni',
   'Sinistri negli ultimi 5 anni',
   'number',
   NULL,
   2, true),
  ('q_attivita_struttura',
   'Dove svolgi la tua attività?',
   'dropdown',
   '[{"value":"solo_studio","label":"Solo studio privato"},{"value":"una_struttura","label":"Esclusivamente in una struttura"},{"value":"piu_strutture","label":"In più strutture"},{"value":"misto","label":"Studio privato e struttura"}]',
   3, true),
  ('q_massimale_rc',
   'Massimale RC desiderato',
   'dropdown',
   '[{"value":1000000,"label":"€ 1.000.000"},{"value":2000000,"label":"€ 2.000.000"},{"value":3000000,"label":"€ 3.000.000"},{"value":5000000,"label":"€ 5.000.000"}]',
   4, false),
  ('q_retroattivita',
   'Retroattività desiderata',
   'dropdown',
   '[{"value":"10_anni","label":"10 anni"},{"value":"illimitata","label":"Illimitata"}]',
   5, false),
  ('q_franchigia',
   'Franchigia',
   'dropdown',
   '[{"value":0,"label":"Nessuna franchigia"},{"value":2500,"label":"€ 2.500"},{"value":10000,"label":"€ 10.000"}]',
   6, false)
) AS q(key, label, type, opts, pos, mandatory)
WHERE s.slug = 'medici';

-- =====================================================
-- Product coverages
-- =====================================================

INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id, c.key, c.name, true, c.dims::jsonb
FROM products p
JOIN (VALUES
  ('amtrust-medico-protetto',   'rc_professionale', 'RC Professionale',
   '["q_professione","q_massimale_rc"]'),
  ('amtrust-colpa-grave-extra', 'rc_colpa_grave',   'RC Colpa Grave',
   '["q_professione","q_massimale_rc","q_retroattivita"]'),
  ('amtrust-medico-under-35',   'rc_under35',       'RC Under 35',
   '["q_massimale_rc"]')
) AS c(slug, key, name, dims) ON p.slug = c.slug;

-- =====================================================
-- Eligibility rules
-- =====================================================

INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.prio
FROM products p
JOIN (VALUES
  ('amtrust-medico-protetto',
   'Solo liberi professionisti',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"dipendente"}',
   'exclude',
   'Questo prodotto è riservato ai liberi professionisti',
   10),
  ('amtrust-medico-protetto',
   'Più di 2 sinistri',
   '{"op":"greater_than","key":"q_sinistri_5_anni","value":2}',
   'manual_quote',
   'Più di 2 sinistri negli ultimi 5 anni: richiesto preventivo manuale',
   20),
  ('amtrust-colpa-grave-extra',
   'Solo dipendenti SSN',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"libero_prof"}',
   'exclude',
   'Questo prodotto è riservato ai medici dipendenti SSN o struttura privata',
   10),
  ('amtrust-medico-under-35',
   'Solo liberi professionisti',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"dipendente"}',
   'exclude',
   'Questo prodotto è riservato ai liberi professionisti',
   10),
  ('amtrust-medico-under-35',
   'Solo under 35',
   '{"op":"greater_than","key":"q_eta","value":35}',
   'exclude',
   'Questo prodotto è disponibile solo fino a 35 anni di età',
   20)
) AS r(slug, name, cond, action, reason, prio) ON p.slug = r.slug;

-- =====================================================
-- Multipliers — AmTrust Medico Protetto
-- I moltiplicatori usano q_eta (da answers Phase A) e chiavi sector
-- =====================================================

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
   '{"op":"all","conditions":[{"op":"greater_than_or_equal","key":"q_eta","value":35},{"op":"less_than_or_equal","key":"q_eta","value":40}]}', 31),
  ('1 sinistro pregresso (+15%)', 1.15,
   '{"op":"equals","key":"q_sinistri_5_anni","value":1}', 40),
  ('2 sinistri pregressi (+50%)', 1.50,
   '{"op":"equals","key":"q_sinistri_5_anni","value":2}', 41),
  ('Età 70 anni o più (+3%)',    1.03,
   '{"op":"greater_than_or_equal","key":"q_eta","value":70}', 50)
) AS m(name, factor, cond, prio)
WHERE p.slug = 'amtrust-medico-protetto';

-- =====================================================
-- Addons — AmTrust Medico Protetto
-- =====================================================

INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by, dimensions)
SELECT p.id, a.key, a.name, a.mode, a.flat, a.trigger::jsonb, a.dims::jsonb
FROM products p
CROSS JOIN (VALUES
  ('ruolo_apicale',
   'Ruolo apicale e direzione sanitaria – Perdite Patrimoniali',
   'flat', 450.00,
   '{"op":"equals","key":"q_addon_ruolo_apicale","value":"si"}',
   NULL),
  ('rct_rco',
   'Perdite Patrimoniali e conduzione studio (RCT-RCO)',
   'flat', 100.00,
   '{"op":"equals","key":"q_addon_rct_rco","value":"si"}',
   NULL),
  ('crediti_ecm',
   'Omesso adempimento Crediti ECM',
   'flat', 40.00,
   '{"op":"equals","key":"q_addon_ecm","value":"si"}',
   NULL),
  ('retroattivita_illimitata',
   'Sovrappremio Retroattività Illimitata',
   'rate_table', NULL,
   '{"op":"equals","key":"q_retroattivita","value":"illimitata"}',
   '["q_tipo_area_medica"]')
) AS a(key, name, mode, flat, trigger, dims)
WHERE p.slug = 'amtrust-medico-protetto';

-- =====================================================
-- Addon rate rows — retroattività illimitata
-- =====================================================

INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id, r.dims::jsonb, r.premium, false
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'amtrust-medico-protetto'
CROSS JOIN (VALUES
  ('{"q_tipo_area_medica":"non_chirurgica"}', 45.00),
  ('{"q_tipo_area_medica":"chirurgica"}',    100.00)
) AS r(dims, premium)
WHERE a.key = 'retroattivita_illimitata';

-- =====================================================
-- Rate rows — AmTrust Medico Protetto
-- Ogni professione è mappata al gruppo di rischio AmTrust.
-- Aree non chirurgiche: massimali 1M/2M/3M/5M
-- Aree chirurgiche: massimali 2M/3M/5M
-- =====================================================

INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', r.prof, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-medico-protetto'
CROSS JOIN (VALUES
  -- Gruppo 1 (non chir): mmg, medico_comunita, pediatra_libera_scelta, medicine_non_convenzionali, medico_abilitato, scienze_alimentazione, medicina_termale
  ('mmg',                        1000000,  497.00),
  ('mmg',                        2000000,  572.00),
  ('mmg',                        3000000,  629.00),
  ('mmg',                        5000000,  673.00),
  ('medico_comunita',            1000000,  497.00),
  ('medico_comunita',            2000000,  572.00),
  ('medico_comunita',            3000000,  629.00),
  ('medico_comunita',            5000000,  673.00),
  ('pediatra_libera_scelta',     1000000,  497.00),
  ('pediatra_libera_scelta',     2000000,  572.00),
  ('pediatra_libera_scelta',     3000000,  629.00),
  ('pediatra_libera_scelta',     5000000,  673.00),
  ('medicine_non_convenzionali', 1000000,  497.00),
  ('medicine_non_convenzionali', 2000000,  572.00),
  ('medicine_non_convenzionali', 3000000,  629.00),
  ('medicine_non_convenzionali', 5000000,  673.00),
  ('medico_abilitato',           1000000,  497.00),
  ('medico_abilitato',           2000000,  572.00),
  ('medico_abilitato',           3000000,  629.00),
  ('medico_abilitato',           5000000,  673.00),
  ('scienze_alimentazione',      1000000,  497.00),
  ('scienze_alimentazione',      2000000,  572.00),
  ('scienze_alimentazione',      3000000,  629.00),
  ('scienze_alimentazione',      5000000,  673.00),
  ('medicina_termale',           1000000,  497.00),
  ('medicina_termale',           2000000,  572.00),
  ('medicina_termale',           3000000,  629.00),
  ('medicina_termale',           5000000,  673.00),
  -- Gruppo 2 (non chir): audiologia, farmacologia, genetica_medica, microbiologia, patologia_clinica
  ('audiologia',                 1000000,  519.00),
  ('audiologia',                 2000000,  597.00),
  ('audiologia',                 3000000,  657.00),
  ('audiologia',                 5000000,  703.00),
  ('farmacologia',               1000000,  519.00),
  ('farmacologia',               2000000,  597.00),
  ('farmacologia',               3000000,  657.00),
  ('farmacologia',               5000000,  703.00),
  ('genetica_medica',            1000000,  519.00),
  ('genetica_medica',            2000000,  597.00),
  ('genetica_medica',            3000000,  657.00),
  ('genetica_medica',            5000000,  703.00),
  ('microbiologia',              1000000,  519.00),
  ('microbiologia',              2000000,  597.00),
  ('microbiologia',              3000000,  657.00),
  ('microbiologia',              5000000,  703.00),
  ('patologia_clinica',          1000000,  519.00),
  ('patologia_clinica',          2000000,  597.00),
  ('patologia_clinica',          3000000,  657.00),
  ('patologia_clinica',          5000000,  703.00),
  -- Gruppo 3: medicina_legale
  ('medicina_legale',            1000000,  579.00),
  ('medicina_legale',            2000000,  666.00),
  ('medicina_legale',            3000000,  733.00),
  ('medicina_legale',            5000000,  784.00),
  -- Gruppo 4: neuropsichiatria, psichiatria, psicologia_clinica
  ('neuropsichiatria',           1000000,  663.00),
  ('neuropsichiatria',           2000000,  762.00),
  ('neuropsichiatria',           3000000,  838.00),
  ('neuropsichiatria',           5000000,  897.00),
  ('psichiatria',                1000000,  663.00),
  ('psichiatria',                2000000,  762.00),
  ('psichiatria',                3000000,  838.00),
  ('psichiatria',                5000000,  897.00),
  ('psicologia_clinica',         1000000,  663.00),
  ('psicologia_clinica',         2000000,  762.00),
  ('psicologia_clinica',         3000000,  838.00),
  ('psicologia_clinica',         5000000,  897.00),
  -- Gruppo 5: allergologia, angiologia, diabetologia, endocrinologia, malattie_infettive
  ('allergologia',               1000000,  718.00),
  ('allergologia',               2000000,  826.00),
  ('allergologia',               3000000,  909.00),
  ('allergologia',               5000000,  973.00),
  ('angiologia',                 1000000,  718.00),
  ('angiologia',                 2000000,  826.00),
  ('angiologia',                 3000000,  909.00),
  ('angiologia',                 5000000,  973.00),
  ('diabetologia',               1000000,  718.00),
  ('diabetologia',               2000000,  826.00),
  ('diabetologia',               3000000,  909.00),
  ('diabetologia',               5000000,  973.00),
  ('endocrinologia',             1000000,  718.00),
  ('endocrinologia',             2000000,  826.00),
  ('endocrinologia',             3000000,  909.00),
  ('endocrinologia',             5000000,  973.00),
  ('malattie_infettive',         1000000,  718.00),
  ('malattie_infettive',         2000000,  826.00),
  ('malattie_infettive',         3000000,  909.00),
  ('malattie_infettive',         5000000,  973.00),
  -- Gruppo 6: oculistica
  ('oculistica',                 1000000,  774.00),
  ('oculistica',                 2000000,  890.00),
  ('oculistica',                 3000000,  979.00),
  ('oculistica',                 5000000, 1048.00),
  -- Gruppo 7: medicina_nucleare
  ('medicina_nucleare',          1000000,  829.00),
  ('medicina_nucleare',          2000000,  953.00),
  ('medicina_nucleare',          3000000, 1048.00),
  ('medicina_nucleare',          5000000, 1121.00),
  -- Gruppo 8: diagnostica_ecografica, epatologia, gastroenterologia, geriatria, medicina_emergenza,
  --           medicina_interna, nefrologia, pneumologia, visite_preoperatorie
  ('diagnostica_ecografica',     1000000,  884.00),
  ('diagnostica_ecografica',     2000000, 1017.00),
  ('diagnostica_ecografica',     3000000, 1119.00),
  ('diagnostica_ecografica',     5000000, 1197.00),
  ('epatologia',                 1000000,  884.00),
  ('epatologia',                 2000000, 1017.00),
  ('epatologia',                 3000000, 1119.00),
  ('epatologia',                 5000000, 1197.00),
  ('gastroenterologia',          1000000,  884.00),
  ('gastroenterologia',          2000000, 1017.00),
  ('gastroenterologia',          3000000, 1119.00),
  ('gastroenterologia',          5000000, 1197.00),
  ('geriatria',                  1000000,  884.00),
  ('geriatria',                  2000000, 1017.00),
  ('geriatria',                  3000000, 1119.00),
  ('geriatria',                  5000000, 1197.00),
  ('medicina_emergenza',         1000000,  884.00),
  ('medicina_emergenza',         2000000, 1017.00),
  ('medicina_emergenza',         3000000, 1119.00),
  ('medicina_emergenza',         5000000, 1197.00),
  ('medicina_interna',           1000000,  884.00),
  ('medicina_interna',           2000000, 1017.00),
  ('medicina_interna',           3000000, 1119.00),
  ('medicina_interna',           5000000, 1197.00),
  ('nefrologia',                 1000000,  884.00),
  ('nefrologia',                 2000000, 1017.00),
  ('nefrologia',                 3000000, 1119.00),
  ('nefrologia',                 5000000, 1197.00),
  ('pneumologia',                1000000,  884.00),
  ('pneumologia',                2000000, 1017.00),
  ('pneumologia',                3000000, 1119.00),
  ('pneumologia',                5000000, 1197.00),
  ('visite_preoperatorie',       1000000,  884.00),
  ('visite_preoperatorie',       2000000, 1017.00),
  ('visite_preoperatorie',       3000000, 1119.00),
  ('visite_preoperatorie',       5000000, 1197.00),
  -- Gruppo 9: patologia, dermatologia, ematologia, oncologia
  ('patologia',                  1000000,  901.00),
  ('patologia',                  2000000, 1036.00),
  ('patologia',                  3000000, 1140.00),
  ('patologia',                  5000000, 1220.00),
  ('dermatologia',               1000000,  901.00),
  ('dermatologia',               2000000, 1036.00),
  ('dermatologia',               3000000, 1140.00),
  ('dermatologia',               5000000, 1220.00),
  ('ematologia',                 1000000,  901.00),
  ('ematologia',                 2000000, 1036.00),
  ('ematologia',                 3000000, 1140.00),
  ('ematologia',                 5000000, 1220.00),
  ('oncologia',                  1000000,  901.00),
  ('oncologia',                  2000000, 1036.00),
  ('oncologia',                  3000000, 1140.00),
  ('oncologia',                  5000000, 1220.00),
  -- Gruppo 10: pediatra_specialista
  ('pediatra_specialista',       1000000,  912.00),
  ('pediatra_specialista',       2000000, 1049.00),
  ('pediatra_specialista',       3000000, 1154.00),
  ('pediatra_specialista',       5000000, 1235.00),
  -- Gruppo 11: terapia_dolore
  ('terapia_dolore',             1000000,  939.00),
  ('terapia_dolore',             2000000, 1080.00),
  ('terapia_dolore',             3000000, 1188.00),
  ('terapia_dolore',             5000000, 1271.00),
  -- Gruppo 12: fisiatria, neurofisiopatologia, neurologia
  ('fisiatria',                  1000000,  967.00),
  ('fisiatria',                  2000000, 1112.00),
  ('fisiatria',                  3000000, 1223.00),
  ('fisiatria',                  5000000, 1309.00),
  ('neurofisiopatologia',        1000000,  967.00),
  ('neurofisiopatologia',        2000000, 1112.00),
  ('neurofisiopatologia',        3000000, 1223.00),
  ('neurofisiopatologia',        5000000, 1309.00),
  ('neurologia',                 1000000,  967.00),
  ('neurologia',                 2000000, 1112.00),
  ('neurologia',                 3000000, 1223.00),
  ('neurologia',                 5000000, 1309.00),
  -- Gruppo 13: igiene_medicina_preventiva, medicina_aeronautica, medicina_del_lavoro, statistica_sanitaria
  ('igiene_medicina_preventiva', 1000000,  995.00),
  ('igiene_medicina_preventiva', 2000000, 1144.00),
  ('igiene_medicina_preventiva', 3000000, 1258.00),
  ('igiene_medicina_preventiva', 5000000, 1346.00),
  ('medicina_aeronautica',       1000000,  995.00),
  ('medicina_aeronautica',       2000000, 1144.00),
  ('medicina_aeronautica',       3000000, 1258.00),
  ('medicina_aeronautica',       5000000, 1346.00),
  ('medicina_del_lavoro',        1000000,  995.00),
  ('medicina_del_lavoro',        2000000, 1144.00),
  ('medicina_del_lavoro',        3000000, 1258.00),
  ('medicina_del_lavoro',        5000000, 1346.00),
  ('statistica_sanitaria',       1000000,  995.00),
  ('statistica_sanitaria',       2000000, 1144.00),
  ('statistica_sanitaria',       3000000, 1258.00),
  ('statistica_sanitaria',       5000000, 1346.00),
  -- Gruppo 14: radioterapia
  ('radioterapia',               1000000, 1105.00),
  ('radioterapia',               2000000, 1271.00),
  ('radioterapia',               3000000, 1398.00),
  ('radioterapia',               5000000, 1496.00),
  -- Gruppo 15: otorinolaringoiatria
  ('otorinolaringoiatria',       1000000, 1188.00),
  ('otorinolaringoiatria',       2000000, 1366.00),
  ('otorinolaringoiatria',       3000000, 1503.00),
  ('otorinolaringoiatria',       5000000, 1608.00),
  -- Gruppo 16: radiodiagnostica
  ('radiodiagnostica',           1000000, 1299.00),
  ('radiodiagnostica',           2000000, 1494.00),
  ('radiodiagnostica',           3000000, 1643.00),
  ('radiodiagnostica',           5000000, 1758.00),
  -- Gruppo 17: cardiologia
  ('cardiologia',                1000000, 1382.00),
  ('cardiologia',                2000000, 1589.00),
  ('cardiologia',                3000000, 1748.00),
  ('cardiologia',                5000000, 1870.00),
  -- Gruppo 18: ortopedia (min massimale 2M)
  ('ortopedia',                  2000000, 1663.00),
  ('ortopedia',                  3000000, 1829.00),
  ('ortopedia',                  5000000, 1957.00),
  -- Gruppo 19: reumatologia
  ('reumatologia',               1000000, 1547.00),
  ('reumatologia',               2000000, 1779.00),
  ('reumatologia',               3000000, 1957.00),
  ('reumatologia',               5000000, 2094.00),
  -- Gruppo 20: medicina_dello_sport
  ('medicina_dello_sport',       1000000, 1658.00),
  ('medicina_dello_sport',       2000000, 1907.00),
  ('medicina_dello_sport',       3000000, 2098.00),
  ('medicina_dello_sport',       5000000, 2245.00),
  -- Gruppo 21: andrologia, urologia
  ('andrologia',                 1000000, 2432.00),
  ('andrologia',                 2000000, 2554.00),
  ('andrologia',                 3000000, 2809.00),
  ('andrologia',                 5000000, 3006.00),
  ('urologia',                   1000000, 2432.00),
  ('urologia',                   2000000, 2554.00),
  ('urologia',                   3000000, 2809.00),
  ('urologia',                   5000000, 3006.00),
  -- Gruppo 29: ginecologia (non chir)
  ('ginecologia',                1000000, 4421.00),
  ('ginecologia',                2000000, 5084.00),
  ('ginecologia',                3000000, 5694.00),
  ('ginecologia',                5000000, 6093.00),
  -- ── AREE CHIRURGICHE (massimali 2M/3M/5M) ──────────────────────────────
  -- Gruppo 22: oculistica_chirurgica
  ('oculistica_chirurgica',            2000000,  2931.00),
  ('oculistica_chirurgica',            3000000,  3283.00),
  ('oculistica_chirurgica',            5000000,  3513.00),
  -- Gruppo 23: anestesia_rianimazione
  ('anestesia_rianimazione',           2000000,  3000.00),
  ('anestesia_rianimazione',           3000000,  3450.00),
  ('anestesia_rianimazione',           5000000,  3692.00),
  -- Gruppo 24: otorinolaringoiatria_chir
  ('otorinolaringoiatria_chir',        2000000,  3608.00),
  ('otorinolaringoiatria_chir',        3000000,  4041.00),
  ('otorinolaringoiatria_chir',        5000000,  4324.00),
  -- Gruppo 25: cardiologia_interventistica
  ('cardiologia_interventistica',      2000000,  3945.00),
  ('cardiologia_interventistica',      3000000,  4418.00),
  ('cardiologia_interventistica',      5000000,  4727.00),
  -- Gruppo 26: oculistica_chirurgica_estetica
  ('oculistica_chirurgica_estetica',   2000000,  4397.00),
  ('oculistica_chirurgica_estetica',   3000000,  4925.00),
  ('oculistica_chirurgica_estetica',   5000000,  5270.00),
  -- Gruppo 27: otorinolaringoiatria_chir_estetica
  ('otorinolaringoiatria_chir_estetica',2000000, 4960.00),
  ('otorinolaringoiatria_chir_estetica',3000000, 5555.00),
  ('otorinolaringoiatria_chir_estetica',5000000, 5944.00),
  -- Gruppo 28: chirurgia_oncologica_ortopedica, chirurgia_ricostruttiva, chirurgia_oncologica_senologica
  ('chirurgia_oncologica_ortopedica',  2000000,  5073.00),
  ('chirurgia_oncologica_ortopedica',  3000000,  5682.00),
  ('chirurgia_oncologica_ortopedica',  5000000,  6080.00),
  ('chirurgia_ricostruttiva',          2000000,  5073.00),
  ('chirurgia_ricostruttiva',          3000000,  5682.00),
  ('chirurgia_ricostruttiva',          5000000,  6080.00),
  ('chirurgia_oncologica_senologica',  2000000,  5073.00),
  ('chirurgia_oncologica_senologica',  3000000,  5682.00),
  ('chirurgia_oncologica_senologica',  5000000,  6080.00),
  -- Gruppo 30: ginecologia_invasiva, ginecologia_fecondazione
  ('ginecologia_invasiva',             2000000,  5186.00),
  ('ginecologia_invasiva',             3000000,  5808.00),
  ('ginecologia_invasiva',             5000000,  6215.00),
  ('ginecologia_fecondazione',         2000000,  5186.00),
  ('ginecologia_fecondazione',         3000000,  5808.00),
  ('ginecologia_fecondazione',         5000000,  6215.00),
  -- Gruppo 31: chirurgia_maxillo_facciale
  ('chirurgia_maxillo_facciale',       2000000,  5637.00),
  ('chirurgia_maxillo_facciale',       3000000,  6313.00),
  ('chirurgia_maxillo_facciale',       5000000,  6755.00),
  -- Gruppo 32: chirurgia_andrologica, chirurgia_urologica
  ('chirurgia_andrologica',            2000000,  5975.00),
  ('chirurgia_andrologica',            3000000,  6692.00),
  ('chirurgia_andrologica',            5000000,  7160.00),
  ('chirurgia_urologica',              2000000,  5975.00),
  ('chirurgia_urologica',              3000000,  6692.00),
  ('chirurgia_urologica',              5000000,  7160.00),
  -- Gruppo 33: chirurgia_maxillo_facciale_estetica
  ('chirurgia_maxillo_facciale_estetica',2000000, 6765.00),
  ('chirurgia_maxillo_facciale_estetica',3000000, 7577.00),
  ('chirurgia_maxillo_facciale_estetica',5000000, 8107.00),
  -- Gruppo 34: chirurgia_addominale, chirurgia_bariatrica, chirurgia_generale, chirurgo_pediatrico,
  --            chirurgia_proctologica, chirurgia_toracica, endocrinochirurgia, chirurgia_apparato_digerente,
  --            nefrologia_chirurgica
  ('chirurgia_addominale',             2000000,  6990.00),
  ('chirurgia_addominale',             3000000,  8039.00),
  ('chirurgia_addominale',             5000000,  8602.00),
  ('chirurgia_bariatrica',             2000000,  6990.00),
  ('chirurgia_bariatrica',             3000000,  8039.00),
  ('chirurgia_bariatrica',             5000000,  8602.00),
  ('chirurgia_generale',               2000000,  6990.00),
  ('chirurgia_generale',               3000000,  8039.00),
  ('chirurgia_generale',               5000000,  8602.00),
  ('chirurgo_pediatrico',              2000000,  6990.00),
  ('chirurgo_pediatrico',              3000000,  8039.00),
  ('chirurgo_pediatrico',              5000000,  8602.00),
  ('chirurgia_proctologica',           2000000,  6990.00),
  ('chirurgia_proctologica',           3000000,  8039.00),
  ('chirurgia_proctologica',           5000000,  8602.00),
  ('chirurgia_toracica',               2000000,  6990.00),
  ('chirurgia_toracica',               3000000,  8039.00),
  ('chirurgia_toracica',               5000000,  8602.00),
  ('endocrinochirurgia',               2000000,  6990.00),
  ('endocrinochirurgia',               3000000,  8039.00),
  ('endocrinochirurgia',               5000000,  8602.00),
  ('chirurgia_apparato_digerente',     2000000,  6990.00),
  ('chirurgia_apparato_digerente',     3000000,  8039.00),
  ('chirurgia_apparato_digerente',     5000000,  8602.00),
  ('nefrologia_chirurgica',            2000000,  6990.00),
  ('nefrologia_chirurgica',            3000000,  8039.00),
  ('nefrologia_chirurgica',            5000000,  8602.00),
  -- Gruppo 35: chirurgia_ginecologica
  ('chirurgia_ginecologica',           2000000,  7215.00),
  ('chirurgia_ginecologica',           3000000,  8297.00),
  ('chirurgia_ginecologica',           5000000,  8878.00),
  -- Gruppo 36: chirurgia_fetale, pediatra_neonatologia
  ('chirurgia_fetale',                 2000000,  7441.00),
  ('chirurgia_fetale',                 3000000,  8557.00),
  ('chirurgia_fetale',                 5000000,  9156.00),
  ('pediatra_neonatologia',            2000000,  7441.00),
  ('pediatra_neonatologia',            3000000,  8557.00),
  ('pediatra_neonatologia',            5000000,  9156.00),
  -- Gruppo 37: chirurgia_mano, ortopedia_traumatologia
  ('chirurgia_mano',                   2000000,  9019.00),
  ('chirurgia_mano',                   3000000, 10372.00),
  ('chirurgia_mano',                   5000000, 11098.00),
  ('ortopedia_traumatologia',          2000000,  9019.00),
  ('ortopedia_traumatologia',          3000000, 10372.00),
  ('ortopedia_traumatologia',          5000000, 11098.00),
  -- Gruppo 38: chirurgia_d_urgenza, chirurgia_vascolare
  ('chirurgia_d_urgenza',              2000000,  9583.00),
  ('chirurgia_d_urgenza',              3000000, 10733.00),
  ('chirurgia_d_urgenza',              5000000, 11484.00),
  ('chirurgia_vascolare',              2000000,  9583.00),
  ('chirurgia_vascolare',              3000000, 10733.00),
  ('chirurgia_vascolare',              5000000, 11484.00),
  -- Gruppo 39: cardiochirurgia
  ('cardiochirurgia',                  2000000, 10710.00),
  ('cardiochirurgia',                  3000000, 11995.00),
  ('cardiochirurgia',                  5000000, 12835.00),
  -- Gruppo 40: chirurgia_estetica_plastica
  ('chirurgia_estetica_plastica',      2000000, 11049.00),
  ('chirurgia_estetica_plastica',      3000000, 12375.00),
  ('chirurgia_estetica_plastica',      5000000, 13241.00),
  -- Gruppo 41: ginecologia_ostetricia_parto
  ('ginecologia_ostetricia_parto',     2000000, 13077.00),
  ('ginecologia_ostetricia_parto',     3000000, 15039.00),
  ('ginecologia_ostetricia_parto',     5000000, 16092.00),
  -- Gruppo 42: ortopedia_spinale
  ('ortopedia_spinale',                2000000, 16911.00),
  ('ortopedia_spinale',                3000000, 19448.00),
  ('ortopedia_spinale',                5000000, 20809.00),
  -- Gruppo 43: neurochirurgia
  ('neurochirurgia',                   2000000, 17475.00),
  ('neurochirurgia',                   3000000, 20096.00),
  ('neurochirurgia',                   5000000, 21503.00)
) AS r(prof, mass, premium)
WHERE cov.key = 'rc_professionale';
