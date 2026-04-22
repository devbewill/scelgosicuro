-- Migration 0020: AmTrust Pubblico Impiego
-- Convenzione 0083 – Ed. 03/2021 – Agg. 09/2022
--
-- Settore: pubblico_impiego
-- Professioni: 37 cariche dirette (le "fasce" del tariffario sono convertite
--   in professioni; nessun livello intermedio q_fascia)
--   Fascia 1 (14): tutte manual_quote per Sezione A
--   Fascia 2 (13): prezzi reali per massimali 500k–4M; 6M manual_quote
--   Fascia 3 (10): prezzi reali per massimali 500k–4M; 6M manual_quote
--
-- Coverages:
--   A) rc_amm_contabile      – obbligatoria  – dims: [q_professione, q_massimale_rc]
--   B) tutela_legale         – opzionale     – dims: [q_professione, q_num_enti]
--   C) infortuni             – opzionale     – flat (nessuna dim)
--
-- Moltiplicatori tipo-ente: condizioni dirette su q_professione (no fascia)
-- Add-on danni materiali: per Fascia 2 (+€70) e Fascia 3 (+€30), escluso dipendente_tecnico_rup
-- Retro illimitata A: ×1.20 (multiplier su coverage rc_amm_contabile)
-- Retro 5 anni B:    ×1.30 (multiplier su coverage tutela_legale)
-- Franchigia €2.500: ×0.84 (solo se sinistri=0)

-- ─────────────────────────────────────────────────────────────────────────────
-- COSTANTI: liste professioni per fascia (usate nelle condizioni multiplier)
-- Fascia 1 slugs:
--   organo_vertice, dirigente_tecnico, direttore_generale_regione,
--   dirigente_legale_procura, direttore_generale_unico, direttore_sanitario,
--   alto_ufficiale, parlamentare, magistrato, capo_gabinetto,
--   presidente_cda_revisori, alta_professionalita, direttore_amm_finanziario, membro_odv
-- Fascia 2 slugs:
--   dipendente_tecnico_rup, dirigente_amministrativo, direttore_responsabile_dip,
--   assessore, ufficiale, agente_contabile, consigliere_regionale,
--   consigliere_provinciale, segretario_comunale, direttore_universitario,
--   cda_istituzioni, nucleo_valutazione, membro_giunta_cciaa
-- Fascia 3 slugs:
--   posizione_organizzativa, sotto_ufficiale, polizia_locale_consigliere,
--   docente, consigliere_federazione_sportiva, consigliere_ordine_professionale,
--   dipendente_ufficio_tecnico, dipendente_amministrativo, assistente_sociale, legale_senza_procura
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 1 — Settore
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sectors (slug, name, description, display_order, is_active)
VALUES ('pubblico_impiego', 'Pubblico Impiego',
        'RC Amministrativa e Contabile, Tutela Legale e Infortuni per dipendenti e cariche pubbliche', 4, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 2 — Professioni
-- ─────────────────────────────────────────────────────────────────────────────

-- Fascia 1 (display_order 1–14)
INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, p.slug, p.name, p.ord, true
FROM sectors s
CROSS JOIN (VALUES
  ('organo_vertice',            'Organo di vertice e suo Vice (Sindaco, Presidente, Rettore, Prefetto, ecc.)', 1),
  ('dirigente_tecnico',         'Dirigente Tecnico',                                                           2),
  ('direttore_generale_regione','Direttore Generale di Regione',                                               3),
  ('dirigente_legale_procura',  'Dirigente Legale con Procura',                                                4),
  ('direttore_generale_unico',  'Direttore Generale Unico',                                                    5),
  ('direttore_sanitario',       'Direttore Sanitario (incluso Direttore di Presidio)',                         6),
  ('alto_ufficiale',            'Alto Ufficiale (da Colonnello in su)',                                        7),
  ('parlamentare',              'Parlamentare',                                                                 8),
  ('magistrato',                'Magistrato',                                                                   9),
  ('capo_gabinetto',            'Capo Gabinetto',                                                              10),
  ('presidente_cda_revisori',   'Presidente / Membri CDA / Collegio Sindacale / Revisori',                    11),
  ('alta_professionalita',      'Alta Professionalità',                                                        12),
  ('direttore_amm_finanziario', 'Direttore Amministrativo / Finanziario',                                     13),
  ('membro_odv',                'Membro ODV / Consiglio di Sorveglianza / Comitato di Gestione',              14)
) AS p(slug, name, ord)
WHERE s.slug = 'pubblico_impiego'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- Fascia 2 (display_order 15–27)
INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, p.slug, p.name, p.ord, true
FROM sectors s
CROSS JOIN (VALUES
  ('dipendente_tecnico_rup',     'Dipendente Tecnico incluso RUP',                                                      15),
  ('dirigente_amministrativo',   'Dirigente Amministrativo',                                                             16),
  ('direttore_responsabile_dip', 'Direttore / Responsabile di Dipartimento / Divisione / Direzione',                    17),
  ('assessore',                  'Assessore',                                                                             18),
  ('ufficiale',                  'Ufficiale',                                                                             19),
  ('agente_contabile',           'Agente Contabile / Tesoriere',                                                         20),
  ('consigliere_regionale',      'Consigliere Regionale',                                                                21),
  ('consigliere_provinciale',    'Consigliere Provinciale / Area Metropolitana',                                         22),
  ('segretario_comunale',        'Segretario Comunale / Provinciale / Generale',                                         23),
  ('direttore_universitario',    'Direttore Universitario (Generale e Amministrativo)',                                  24),
  ('cda_istituzioni',            'CDA di Istituzioni Scolastiche / Fondazioni non Economiche / Casse e Ordini Prof.',   25),
  ('nucleo_valutazione',         'Componente Nucleo di Valutazione / OIV',                                               26),
  ('membro_giunta_cciaa',        'Membro Giunta Camera di Commercio',                                                    27)
) AS p(slug, name, ord)
WHERE s.slug = 'pubblico_impiego'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- Fascia 3 (display_order 28–37)
INSERT INTO professions (sector_id, slug, name, display_order, is_active)
SELECT s.id, p.slug, p.name, p.ord, true
FROM sectors s
CROSS JOIN (VALUES
  ('posizione_organizzativa',         'Posizione Organizzativa incluso RUP',                              28),
  ('sotto_ufficiale',                 'Sotto Ufficiale',                                                   29),
  ('polizia_locale_consigliere',      'Polizia Locale / Consigliere Comunale / Municipio / Circoscrizione', 30),
  ('docente',                         'Docente',                                                            31),
  ('consigliere_federazione_sportiva','Consigliere delle Federazioni Sportive',                             32),
  ('consigliere_ordine_professionale','Consigliere Ordini Professionali',                                   33),
  ('dipendente_ufficio_tecnico',      'Dipendente di Ufficio Tecnico senza Progettazione',                  34),
  ('dipendente_amministrativo',       'Dipendente Amministrativo',                                          35),
  ('assistente_sociale',              'Assistente Sociale',                                                  36),
  ('legale_senza_procura',            'Legale senza Procura',                                                37)
) AS p(slug, name, ord)
WHERE s.slug = 'pubblico_impiego'
ON CONFLICT (sector_id, slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 3 — Prodotto
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT ins.id, sec.id,
       'amtrust-pubblico-impiego',
       'AmTrust Pubblico Impiego',
       'RC Amministrativa e Contabile, Tutela Legale e Infortuni per dipendenti e cariche pubbliche.',
       '2022-09',
       true
FROM insurers ins
JOIN sectors sec ON sec.slug = 'pubblico_impiego'
WHERE ins.slug = 'amtrust'
ON CONFLICT ON CONSTRAINT products_insurer_id_slug_version_key DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 4 — Coverages
-- ─────────────────────────────────────────────────────────────────────────────

-- A) RC Amministrativa e Contabile (obbligatoria)
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions, position)
SELECT p.id,
       'rc_amm_contabile',
       'RC Amministrativa e Amministrativo/Contabile (Sezione A)',
       true,
       '["q_professione","q_massimale_rc"]'::jsonb,
       1
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- B) Tutela Legale (opzionale)
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions,
       available_if, position)
SELECT p.id,
       'tutela_legale',
       'Tutela Legale (Sezione B)',
       false,
       '["q_professione","q_num_enti"]'::jsonb,
       '{"op":"equals","key":"q_addon_tutela_legale","value":"si"}'::jsonb,
       2
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 5 — Sector questions
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO sector_questions
  (sector_id, key, label, type, options, validation, position, is_required, visible_if)
SELECT s.id, q.key, q.label, q.type, q.opts::jsonb, q.valid::jsonb, q.pos, q.req, q.vis::jsonb
FROM sectors s
CROSS JOIN (VALUES
  ('q_massimale_rc',
   'Massimale RC desiderato',
   'dropdown',
   '[{"value":500000,"label":"€ 500.000"},{"value":1000000,"label":"€ 1.000.000"},{"value":2000000,"label":"€ 2.000.000"},{"value":4000000,"label":"€ 4.000.000"},{"value":6000000,"label":"€ 6.000.000"}]',
   'null', 1, true, 'null'),
  ('q_tipo_ente',
   'Tipologia dell''ente o società',
   'dropdown',
   '[{"value":"comune_piccolo","label":"Comune fino a 15.000 abitanti"},{"value":"comune_grande","label":"Comune oltre 50.000 abitanti"},{"value":"comune_medio","label":"Comune tra 15.000 e 50.000 abitanti"},{"value":"amm_regionale","label":"Amministrazione Regionale"},{"value":"ente_sanitario_socio_ambientale","label":"Ente Sanitario / Socio-Assistenziale / Ambientale"},{"value":"societa_pubblica_economica","label":"Società o Ente Pubblico Economico"},{"value":"altro","label":"Altra tipologia di Ente / Amministrazione"}]',
   'null', 2, true, 'null'),
  ('q_num_enti',
   'Numero di Enti / Società per cui si intende la carica',
   'dropdown',
   '[{"value":"1_ente","label":"1 Ente / Società"},{"value":"fino_3_enti","label":"2 o 3 Enti / Società diversi"},{"value":"oltre_3_enti","label":"Oltre 3 Enti / Società"}]',
   'null', 3, true, 'null'),
  ('q_sinistri_rc_5_anni',
   'Richieste di risarcimento o azioni legali negli ultimi 5 anni (Sezione A)',
   'number',
   'null',
   '{"min":0,"max":10,"step":1}', 4, true, 'null')
) AS q(key, label, type, opts, valid, pos, req, vis)
WHERE s.slug = 'pubblico_impiego'
ON CONFLICT (sector_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 6 — Product questions (phase=addon, FASE C)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, validation,
   position, section, is_required, visible_if, phase)
SELECT p.id, q.key, q.label, q.help_text, q.type, q.opts::jsonb, NULL,
       q.pos, q.section, false, q.vis::jsonb, 'addon'
FROM products p
CROSS JOIN (VALUES
  ('q_addon_retro_illimitata',
   'Retroattività illimitata Sezione A (+20% del premio base)',
   'La garanzia prevede retroattività base 10 anni. L''estensione illimitata comporta un sovrapprezzo del 20%.',
   'dropdown',
   '[{"value":"si","label":"Sì, estendi a illimitata (+20%)"},{"value":"no","label":"No, mantengo 10 anni"}]',
   1, 'Opzioni Sezione A', 'null'),
  ('q_addon_franchigia_2500',
   'Franchigia facoltativa € 2.500 (-16% sul premio Sezione A)',
   'Acquistabile solo in assenza di sinistri pregressi. Riduce il premio della Sezione A del 16%.',
   'dropdown',
   '[{"value":"si","label":"Sì, inserisci franchigia (-16%)"},{"value":"no","label":"No"}]',
   2, 'Opzioni Sezione A',
   '{"op":"equals","key":"q_sinistri_rc_5_anni","value":0}'),
  ('q_addon_danni_materiali',
   'Estensione danni materiali – Assicurati senza qualifica tecnica',
   'Non disponibile per Dipendente Tecnico incluso RUP. Aggiunge copertura danni materiali: €70 per Fascia 2, €30 per Fascia 3.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi"},{"value":"no","label":"No"}]',
   3, 'Opzioni Sezione A',
   '{"op":"not_equals","key":"q_professione","value":"dipendente_tecnico_rup"}'),
  ('q_addon_tutela_legale',
   'Aggiungi Tutela Legale (Sezione B)',
   'Massimale €100.000 per sinistro. Scoperto 10% con minimo €1.500. Il premio dipende dalla carica e dal numero di enti.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi Tutela Legale"},{"value":"no","label":"No"}]',
   4, 'Tutela Legale', 'null'),
  ('q_addon_retro_tutela_5anni',
   'Retroattività Tutela Legale a 5 anni (+30% del premio Sezione B)',
   'La garanzia prevede retroattività base 3 anni. L''estensione a 5 anni comporta un sovrapprezzo del 30%.',
   'dropdown',
   '[{"value":"si","label":"Sì, estendi a 5 anni (+30%)"},{"value":"no","label":"No, mantengo 3 anni"}]',
   5, 'Tutela Legale',
   '{"op":"equals","key":"q_addon_tutela_legale","value":"si"}'),
  ('q_addon_vertenze_lavoro',
   'Vertenze di lavoro, Circolazione stradale e Vita privata (Sezione B.1)',
   'Acquistabile solo con Tutela Legale attiva. Premio aggiuntivo: €80 Fascia 1, €60 Fascia 2, €40 Fascia 3.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi"},{"value":"no","label":"No"}]',
   6, 'Tutela Legale',
   '{"op":"equals","key":"q_addon_tutela_legale","value":"si"}'),
  ('q_addon_infortuni',
   'Aggiungi Infortuni – Morte e Invalidità Permanente (Sezione C)',
   'Premio fisso €70 totale (€35 morte + €35 IP). Somma assicurata €50.000 per garanzia. Franchigia IP 3%.',
   'dropdown',
   '[{"value":"si","label":"Sì, aggiungi Infortuni (+€70)"},{"value":"no","label":"No"}]',
   7, 'Infortuni', 'null')
) AS q(key, label, help_text, type, opts, pos, section, vis)
WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 7 — Eligibility rules
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.prio
FROM products p
CROSS JOIN (VALUES
  ('Oltre 3 Enti – contattare Sales',
   '{"op":"equals","key":"q_num_enti","value":"oltre_3_enti"}',
   'manual_quote',
   'Per cariche presso più di 3 enti diversi la quotazione richiede valutazione del Sales AmTrust.',
   10),
  ('Sinistri pregressi – valutazione Direzione',
   '{"op":"greater_than","key":"q_sinistri_rc_5_anni","value":0}',
   'manual_quote',
   'In presenza di sinistri o azioni legali pregressi la quotazione è soggetta alla preventiva valutazione AmTrust.',
   20)
) AS r(name, cond, action, reason, prio)
WHERE p.slug = 'amtrust-pubblico-impiego';

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 8 — Moltiplicatori
--
-- 8a) Tipo ente (su coverage rc_amm_contabile = coverage_id NULL per ora,
--     legati al prodotto; il motore applica solo se q_tipo_ente corrisponde)
-- 8b) Retro illimitata Sezione A (+20%) — su coverage rc_amm_contabile
-- 8c) Retro 5 anni Sezione B (+30%)    — su coverage tutela_legale
-- 8d) Franchigia €2.500 (-16%)         — su coverage rc_amm_contabile
-- ─────────────────────────────────────────────────────────────────────────────

-- 8a.1) Comuni <15k (-15%): tutte le professioni tranne dipendente_tecnico_rup
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Comune < 15.000 abitanti (-15%)',
       0.85,
       '{"all":[{"op":"equals","key":"q_tipo_ente","value":"comune_piccolo"},{"op":"not_equals","key":"q_professione","value":"dipendente_tecnico_rup"}]}'::jsonb,
       10
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8a.2) Comuni >50k (+10%): tutte le professioni
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Comune > 50.000 abitanti (+10%)',
       1.10,
       '{"op":"equals","key":"q_tipo_ente","value":"comune_grande"}'::jsonb,
       11
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8a.3) Amministrazioni Regionali (+10%): solo Fascia 1
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Amministrazione Regionale (+10%) – Fascia 1',
       1.10,
       '{"all":[{"op":"equals","key":"q_tipo_ente","value":"amm_regionale"},{"op":"in","key":"q_professione","value":["organo_vertice","dirigente_tecnico","direttore_generale_regione","dirigente_legale_procura","direttore_generale_unico","direttore_sanitario","alto_ufficiale","parlamentare","magistrato","capo_gabinetto","presidente_cda_revisori","alta_professionalita","direttore_amm_finanziario","membro_odv"]}]}'::jsonb,
       12
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8a.4) Enti sanitari/socio-assistenziali/ambientali (+15%): Fascia 1 e Fascia 2
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Ente Sanitario / Socio-Assistenziale / Ambientale (+15%) – Fascia 1+2',
       1.15,
       '{"all":[{"op":"equals","key":"q_tipo_ente","value":"ente_sanitario_socio_ambientale"},{"op":"in","key":"q_professione","value":["organo_vertice","dirigente_tecnico","direttore_generale_regione","dirigente_legale_procura","direttore_generale_unico","direttore_sanitario","alto_ufficiale","parlamentare","magistrato","capo_gabinetto","presidente_cda_revisori","alta_professionalita","direttore_amm_finanziario","membro_odv","dipendente_tecnico_rup","dirigente_amministrativo","direttore_responsabile_dip","assessore","ufficiale","agente_contabile","consigliere_regionale","consigliere_provinciale","segretario_comunale","direttore_universitario","cda_istituzioni","nucleo_valutazione","membro_giunta_cciaa"]}]}'::jsonb,
       13
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8a.5) Società e Enti Pubblici Economici (+10%): solo Fascia 1
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Società / Ente Pubblico Economico (+10%) – Fascia 1',
       1.10,
       '{"all":[{"op":"equals","key":"q_tipo_ente","value":"societa_pubblica_economica"},{"op":"in","key":"q_professione","value":["organo_vertice","dirigente_tecnico","direttore_generale_regione","dirigente_legale_procura","direttore_generale_unico","direttore_sanitario","alto_ufficiale","parlamentare","magistrato","capo_gabinetto","presidente_cda_revisori","alta_professionalita","direttore_amm_finanziario","membro_odv"]}]}'::jsonb,
       14
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8b) Retroattività illimitata Sezione A (+20%)
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Retroattività illimitata Sezione A (+20%)',
       1.20,
       '{"op":"equals","key":"q_addon_retro_illimitata","value":"si"}'::jsonb,
       20
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8c) Retroattività 5 anni Sezione B (+30%)
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Retroattività 5 anni Tutela Legale (+30%)',
       1.30,
       '{"op":"equals","key":"q_addon_retro_tutela_5anni","value":"si"}'::jsonb,
       20
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'tutela_legale'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- 8d) Franchigia €2.500 (-16%)
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id,
       'Franchigia €2.500 (-16%)',
       0.84,
       '{"all":[{"op":"equals","key":"q_addon_franchigia_2500","value":"si"},{"op":"equals","key":"q_sinistri_rc_5_anni","value":0}]}'::jsonb,
       30
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_amm_contabile'
WHERE p.slug = 'amtrust-pubblico-impiego';

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 9 — Add-on flat
--
-- Danni materiali (A.1): flat differenziato per fascia, via available_if su professione
-- Vertenze lavoro (B.1): flat per fascia, via available_if su professione
-- Infortuni (C): flat €70, sempre disponibile
-- ─────────────────────────────────────────────────────────────────────────────

-- A.1 Danni materiali Fascia 2 (+€70) — escluso dipendente_tecnico_rup
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if)
SELECT p.id,
       'danni_materiali_f2',
       'Estensione Danni Materiali – Fascia 2',
       'flat', 70.00,
       '{"op":"equals","key":"q_addon_danni_materiali","value":"si"}'::jsonb,
       '{"op":"in","key":"q_professione","value":["dirigente_amministrativo","direttore_responsabile_dip","assessore","ufficiale","agente_contabile","consigliere_regionale","consigliere_provinciale","segretario_comunale","direttore_universitario","cda_istituzioni","nucleo_valutazione","membro_giunta_cciaa"]}'::jsonb
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- A.1 Danni materiali Fascia 3 (+€30)
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if)
SELECT p.id,
       'danni_materiali_f3',
       'Estensione Danni Materiali – Fascia 3',
       'flat', 30.00,
       '{"op":"equals","key":"q_addon_danni_materiali","value":"si"}'::jsonb,
       '{"op":"in","key":"q_professione","value":["posizione_organizzativa","sotto_ufficiale","polizia_locale_consigliere","docente","consigliere_federazione_sportiva","consigliere_ordine_professionale","dipendente_ufficio_tecnico","dipendente_amministrativo","assistente_sociale","legale_senza_procura"]}'::jsonb
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- B.1 Vertenze lavoro Fascia 2 (+€60)
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if)
SELECT p.id,
       'vertenze_lavoro_f2',
       'Vertenze Lavoro, Circolazione e Vita Privata – Fascia 2',
       'flat', 60.00,
       '{"all":[{"op":"equals","key":"q_addon_vertenze_lavoro","value":"si"},{"op":"equals","key":"q_addon_tutela_legale","value":"si"}]}'::jsonb,
       '{"op":"in","key":"q_professione","value":["dipendente_tecnico_rup","dirigente_amministrativo","direttore_responsabile_dip","assessore","ufficiale","agente_contabile","consigliere_regionale","consigliere_provinciale","segretario_comunale","direttore_universitario","cda_istituzioni","nucleo_valutazione","membro_giunta_cciaa"]}'::jsonb
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- B.1 Vertenze lavoro Fascia 3 (+€40)
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if)
SELECT p.id,
       'vertenze_lavoro_f3',
       'Vertenze Lavoro, Circolazione e Vita Privata – Fascia 3',
       'flat', 40.00,
       '{"all":[{"op":"equals","key":"q_addon_vertenze_lavoro","value":"si"},{"op":"equals","key":"q_addon_tutela_legale","value":"si"}]}'::jsonb,
       '{"op":"in","key":"q_professione","value":["posizione_organizzativa","sotto_ufficiale","polizia_locale_consigliere","docente","consigliere_federazione_sportiva","consigliere_ordine_professionale","dipendente_ufficio_tecnico","dipendente_amministrativo","assistente_sociale","legale_senza_procura"]}'::jsonb
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- C) Infortuni flat €70
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by)
SELECT p.id,
       'infortuni',
       'Infortuni – Morte e Invalidità Permanente (Sezione C)',
       'flat', 70.00,
       '{"op":"equals","key":"q_addon_infortuni","value":"si"}'::jsonb
FROM products p WHERE p.slug = 'amtrust-pubblico-impiego'
ON CONFLICT (product_id, key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 10 — Rate rows Sezione A (rc_amm_contabile)
--
-- Fascia 1 (14 professioni): tutte manual_quote per ogni massimale
-- Fascia 2 (13 professioni): prezzi reali 500k/1M/2M/4M; manual_quote 6M
-- Fascia 3 (10 professioni): prezzi reali 500k/1M/2M/4M; manual_quote 6M
-- ─────────────────────────────────────────────────────────────────────────────

-- Fascia 1: tutte manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', mass.v),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('organo_vertice'), ('dirigente_tecnico'), ('direttore_generale_regione'),
  ('dirigente_legale_procura'), ('direttore_generale_unico'), ('direttore_sanitario'),
  ('alto_ufficiale'), ('parlamentare'), ('magistrato'), ('capo_gabinetto'),
  ('presidente_cda_revisori'), ('alta_professionalita'), ('direttore_amm_finanziario'), ('membro_odv')
) AS prof(slug)
CROSS JOIN (VALUES (500000),(1000000),(2000000),(4000000),(6000000)) AS mass(v)
WHERE cov.key = 'rc_amm_contabile';

-- Fascia 2: prezzi reali 500k–4M
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('dipendente_tecnico_rup'), ('dirigente_amministrativo'), ('direttore_responsabile_dip'),
  ('assessore'), ('ufficiale'), ('agente_contabile'), ('consigliere_regionale'),
  ('consigliere_provinciale'), ('segretario_comunale'), ('direttore_universitario'),
  ('cda_istituzioni'), ('nucleo_valutazione'), ('membro_giunta_cciaa')
) AS prof(slug)
CROSS JOIN (VALUES
  (500000,  190.00),
  (1000000, 230.00),
  (2000000, 250.00),
  (4000000, 340.00)
) AS r(mass, premium)
WHERE cov.key = 'rc_amm_contabile';

-- Fascia 2: 6M manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', 6000000),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('dipendente_tecnico_rup'), ('dirigente_amministrativo'), ('direttore_responsabile_dip'),
  ('assessore'), ('ufficiale'), ('agente_contabile'), ('consigliere_regionale'),
  ('consigliere_provinciale'), ('segretario_comunale'), ('direttore_universitario'),
  ('cda_istituzioni'), ('nucleo_valutazione'), ('membro_giunta_cciaa')
) AS prof(slug)
WHERE cov.key = 'rc_amm_contabile';

-- Fascia 3: prezzi reali 500k–4M
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('posizione_organizzativa'), ('sotto_ufficiale'), ('polizia_locale_consigliere'),
  ('docente'), ('consigliere_federazione_sportiva'), ('consigliere_ordine_professionale'),
  ('dipendente_ufficio_tecnico'), ('dipendente_amministrativo'), ('assistente_sociale'), ('legale_senza_procura')
) AS prof(slug)
CROSS JOIN (VALUES
  (500000,  120.00),
  (1000000, 140.00),
  (2000000, 180.00),
  (4000000, 230.00)
) AS r(mass, premium)
WHERE cov.key = 'rc_amm_contabile';

-- Fascia 3: 6M manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_massimale_rc', 6000000),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('posizione_organizzativa'), ('sotto_ufficiale'), ('polizia_locale_consigliere'),
  ('docente'), ('consigliere_federazione_sportiva'), ('consigliere_ordine_professionale'),
  ('dipendente_ufficio_tecnico'), ('dipendente_amministrativo'), ('assistente_sociale'), ('legale_senza_procura')
) AS prof(slug)
WHERE cov.key = 'rc_amm_contabile';

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTE 11 — Rate rows Sezione B (tutela_legale)
--
-- dims: [q_professione, q_num_enti]
-- Fascia 1: tutte manual_quote
-- Fascia 2: 1_ente=285, fino_3_enti=315; oltre_3_enti=manual_quote
-- Fascia 3: 1_ente=200, fino_3_enti=250; oltre_3_enti=manual_quote
-- ─────────────────────────────────────────────────────────────────────────────

-- Fascia 1: tutte manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_num_enti', enti.v),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('organo_vertice'), ('dirigente_tecnico'), ('direttore_generale_regione'),
  ('dirigente_legale_procura'), ('direttore_generale_unico'), ('direttore_sanitario'),
  ('alto_ufficiale'), ('parlamentare'), ('magistrato'), ('capo_gabinetto'),
  ('presidente_cda_revisori'), ('alta_professionalita'), ('direttore_amm_finanziario'), ('membro_odv')
) AS prof(slug)
CROSS JOIN (VALUES ('1_ente'),('fino_3_enti'),('oltre_3_enti')) AS enti(v)
WHERE cov.key = 'tutela_legale';

-- Fascia 2: prezzi reali 1_ente e fino_3_enti
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_num_enti', r.enti),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('dipendente_tecnico_rup'), ('dirigente_amministrativo'), ('direttore_responsabile_dip'),
  ('assessore'), ('ufficiale'), ('agente_contabile'), ('consigliere_regionale'),
  ('consigliere_provinciale'), ('segretario_comunale'), ('direttore_universitario'),
  ('cda_istituzioni'), ('nucleo_valutazione'), ('membro_giunta_cciaa')
) AS prof(slug)
CROSS JOIN (VALUES
  ('1_ente',      285.00),
  ('fino_3_enti', 315.00)
) AS r(enti, premium)
WHERE cov.key = 'tutela_legale';

-- Fascia 2: oltre_3_enti manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_num_enti', 'oltre_3_enti'),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('dipendente_tecnico_rup'), ('dirigente_amministrativo'), ('direttore_responsabile_dip'),
  ('assessore'), ('ufficiale'), ('agente_contabile'), ('consigliere_regionale'),
  ('consigliere_provinciale'), ('segretario_comunale'), ('direttore_universitario'),
  ('cda_istituzioni'), ('nucleo_valutazione'), ('membro_giunta_cciaa')
) AS prof(slug)
WHERE cov.key = 'tutela_legale';

-- Fascia 3: prezzi reali 1_ente e fino_3_enti
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_num_enti', r.enti),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('posizione_organizzativa'), ('sotto_ufficiale'), ('polizia_locale_consigliere'),
  ('docente'), ('consigliere_federazione_sportiva'), ('consigliere_ordine_professionale'),
  ('dipendente_ufficio_tecnico'), ('dipendente_amministrativo'), ('assistente_sociale'), ('legale_senza_procura')
) AS prof(slug)
CROSS JOIN (VALUES
  ('1_ente',      200.00),
  ('fino_3_enti', 250.00)
) AS r(enti, premium)
WHERE cov.key = 'tutela_legale';

-- Fascia 3: oltre_3_enti manual_quote
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', prof.slug, 'q_num_enti', 'oltre_3_enti'),
       NULL, true
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-pubblico-impiego'
CROSS JOIN (VALUES
  ('posizione_organizzativa'), ('sotto_ufficiale'), ('polizia_locale_consigliere'),
  ('docente'), ('consigliere_federazione_sportiva'), ('consigliere_ordine_professionale'),
  ('dipendente_ufficio_tecnico'), ('dipendente_amministrativo'), ('assistente_sociale'), ('legale_senza_procura')
) AS prof(slug)
WHERE cov.key = 'tutela_legale';
