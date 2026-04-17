-- Pilot seed for NL07 (Chirurgo generale): 2 insurers, 2 products, 9 questions,
-- 1 published questionnaire, eligibility/pricing/scoring/recommendation rules.
--
-- Apply AFTER 0001_init_phase_a, seed.sql, 0002_fix_rls_phase_a, 0003_catalog_form_engine.
-- UUIDs are hardcoded so re-seeding stays deterministic and FKs line up.

begin;

------------------------------------------------------------------------
-- Insurers
------------------------------------------------------------------------

insert into public.insurers (id, code, name, website) values
  ('00000000-0000-4000-8000-000000000001', 'AXA',    'AXA Assicurazioni',  'https://www.axa.it'),
  ('00000000-0000-4000-8000-000000000002', 'ASSITA', 'AssIta',             'https://www.assita.it');

------------------------------------------------------------------------
-- Product types
------------------------------------------------------------------------

insert into public.product_types (id, name, category) values
  ('RC_MEDICI', 'RC Professionale Medici', 'ATT');

------------------------------------------------------------------------
-- Products
------------------------------------------------------------------------

insert into public.products (id, insurer_id, product_type_id, code, name, description, status)
values
  ('00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000001',
   'RC_MEDICI',
   'AXA_MEDICI_TOP',
   'Medici Top',
   'Copertura premium con tutela legale inclusa opzionale, assistenza 24/7.',
   'active'),
  ('00000000-0000-4000-8000-000000000102',
   '00000000-0000-4000-8000-000000000002',
   'RC_MEDICI',
   'ASSITA_MEDICI_FLEX',
   'AssIta Flex',
   'Polizza RC Medici flessibile, esclude la chirurgia estetica.',
   'active');

insert into public.activity_products (activity_id, product_id, is_core, sort_order) values
  ('NL07', '00000000-0000-4000-8000-000000000101', true, 10),
  ('NL07', '00000000-0000-4000-8000-000000000102', true, 20);

------------------------------------------------------------------------
-- Questions bank
------------------------------------------------------------------------

insert into public.questions (key, label, help_text, type, options, validation, category) values
  ('q_specializzazione_medica',
   'Specializzazione',
   null,
   'dropdown',
   '[
     {"value":"chirurgia_generale","label":"Chirurgia generale"},
     {"value":"medicina_interna","label":"Medicina interna"},
     {"value":"medicina_generale","label":"Medicina generale"}
   ]'::jsonb,
   '{"required":true}'::jsonb,
   'professione'),

  ('q_anno_iscrizione_albo',
   'Anno di iscrizione all''albo',
   'Anno in cui hai ottenuto l''iscrizione all''Ordine dei Medici.',
   'number',
   null,
   '{"required":true,"min":1960,"max":2026}'::jsonb,
   'professione'),

  ('q_volume_affari_annuo',
   'Volume d''affari annuo',
   null,
   'currency',
   null,
   '{"required":true,"min":0}'::jsonb,
   'professione'),

  ('q_attivita_chirurgica_estetica',
   'Svolgi attività di chirurgia estetica?',
   null,
   'choice',
   '[{"value":"si","label":"Sì"},{"value":"no","label":"No"}]'::jsonb,
   '{"required":true}'::jsonb,
   'pratica'),

  ('q_sinistri_5_anni',
   'Hai avuto sinistri negli ultimi 5 anni?',
   null,
   'choice',
   '[{"value":"si","label":"Sì"},{"value":"no","label":"No"}]'::jsonb,
   '{"required":true}'::jsonb,
   'storico'),

  ('q_polizza_in_corso',
   'Hai una polizza RC attualmente in corso?',
   null,
   'choice',
   '[{"value":"si","label":"Sì"},{"value":"no","label":"No"}]'::jsonb,
   '{"required":true}'::jsonb,
   'storico'),

  ('q_massimale_desiderato',
   'Massimale desiderato',
   null,
   'choice',
   '[
     {"value":"500000","label":"€ 500.000"},
     {"value":"1000000","label":"€ 1.000.000"},
     {"value":"2000000","label":"€ 2.000.000"}
   ]'::jsonb,
   '{"required":true}'::jsonb,
   'polizza'),

  ('q_retroattivita',
   'Retroattività richiesta',
   null,
   'choice',
   '[
     {"value":"1y","label":"1 anno"},
     {"value":"3y","label":"3 anni"},
     {"value":"5y","label":"5 anni"},
     {"value":"unlimited","label":"Illimitata"}
   ]'::jsonb,
   '{"required":true}'::jsonb,
   'polizza'),

  ('q_tutela_legale_opzione',
   'Vuoi includere la tutela legale?',
   'Copertura aggiuntiva per spese legali.',
   'choice',
   '[{"value":"si","label":"Sì"},{"value":"no","label":"No"}]'::jsonb,
   '{"required":true}'::jsonb,
   'polizza');

------------------------------------------------------------------------
-- Questionnaire (NL07 v1, published)
------------------------------------------------------------------------

insert into public.questionnaires (id, activity_id, version, status, definition, published_at)
values (
  '00000000-0000-4000-8000-000000000201',
  'NL07',
  1,
  'published',
  $json$
  {
    "title": "Preventivo RC Professionale Medici",
    "sections": [
      {
        "key": "professione",
        "title": "La tua professione",
        "items": [
          { "question_key": "q_specializzazione_medica", "required": true },
          { "question_key": "q_anno_iscrizione_albo",   "required": true },
          { "question_key": "q_volume_affari_annuo",    "required": true }
        ]
      },
      {
        "key": "pratica",
        "title": "La tua pratica",
        "items": [
          { "question_key": "q_attivita_chirurgica_estetica", "required": true }
        ]
      },
      {
        "key": "storico",
        "title": "Sinistri e polizze pregresse",
        "items": [
          { "question_key": "q_sinistri_5_anni",  "required": true },
          { "question_key": "q_polizza_in_corso", "required": true }
        ]
      },
      {
        "key": "polizza",
        "title": "La polizza che cerchi",
        "items": [
          { "question_key": "q_massimale_desiderato",  "required": true },
          { "question_key": "q_retroattivita",         "required": true },
          { "question_key": "q_tutela_legale_opzione", "required": true }
        ]
      }
    ]
  }
  $json$::jsonb,
  now()
);

------------------------------------------------------------------------
-- Eligibility
------------------------------------------------------------------------

-- AssIta Flex: esclude chi fa chirurgia estetica
insert into public.product_eligibility_rules
  (product_id, question_key, operator, expected_value, exclusion_reason, sort_order)
values (
  '00000000-0000-4000-8000-000000000102',
  'q_attivita_chirurgica_estetica',
  'equals',
  'si',
  'AssIta Flex non copre la chirurgia estetica',
  10
);

------------------------------------------------------------------------
-- Base prices (per specializzazione)
------------------------------------------------------------------------

-- AXA Medici Top
insert into public.product_base_prices (product_id, question_key, answer_value, base_price, is_default) values
  ('00000000-0000-4000-8000-000000000101', 'q_specializzazione_medica', 'chirurgia_generale', 1350, false),
  ('00000000-0000-4000-8000-000000000101', 'q_specializzazione_medica', 'medicina_interna',    900, false),
  ('00000000-0000-4000-8000-000000000101', 'q_specializzazione_medica', 'medicina_generale',   750, true);

-- AssIta Flex
insert into public.product_base_prices (product_id, question_key, answer_value, base_price, is_default) values
  ('00000000-0000-4000-8000-000000000102', 'q_specializzazione_medica', 'chirurgia_generale',  950, false),
  ('00000000-0000-4000-8000-000000000102', 'q_specializzazione_medica', 'medicina_interna',    650, false),
  ('00000000-0000-4000-8000-000000000102', 'q_specializzazione_medica', 'medicina_generale',   520, true);

------------------------------------------------------------------------
-- Multipliers (match esatto)
------------------------------------------------------------------------

-- Massimale (entrambi i prodotti)
insert into public.product_multipliers (product_id, question_key, answer_value, multiplier, sort_order) values
  ('00000000-0000-4000-8000-000000000101', 'q_massimale_desiderato',  '500000', 1.00, 10),
  ('00000000-0000-4000-8000-000000000101', 'q_massimale_desiderato', '1000000', 1.35, 20),
  ('00000000-0000-4000-8000-000000000101', 'q_massimale_desiderato', '2000000', 1.75, 30),
  ('00000000-0000-4000-8000-000000000102', 'q_massimale_desiderato',  '500000', 1.00, 10),
  ('00000000-0000-4000-8000-000000000102', 'q_massimale_desiderato', '1000000', 1.25, 20);

-- Retroattività
insert into public.product_multipliers (product_id, question_key, answer_value, multiplier, sort_order) values
  ('00000000-0000-4000-8000-000000000101', 'q_retroattivita',   '1y', 1.00, 10),
  ('00000000-0000-4000-8000-000000000101', 'q_retroattivita',   '3y', 1.08, 20),
  ('00000000-0000-4000-8000-000000000101', 'q_retroattivita',   '5y', 1.15, 30),
  ('00000000-0000-4000-8000-000000000101', 'q_retroattivita', 'unlimited', 1.25, 40),
  ('00000000-0000-4000-8000-000000000102', 'q_retroattivita',   '1y', 1.00, 10),
  ('00000000-0000-4000-8000-000000000102', 'q_retroattivita',   '3y', 1.10, 20),
  ('00000000-0000-4000-8000-000000000102', 'q_retroattivita',   '5y', 1.20, 30);

-- Sinistri (penalità)
insert into public.product_multipliers (product_id, question_key, answer_value, multiplier, sort_order) values
  ('00000000-0000-4000-8000-000000000101', 'q_sinistri_5_anni', 'si', 1.25, 10),
  ('00000000-0000-4000-8000-000000000101', 'q_sinistri_5_anni', 'no', 1.00, 20),
  ('00000000-0000-4000-8000-000000000102', 'q_sinistri_5_anni', 'si', 1.30, 10),
  ('00000000-0000-4000-8000-000000000102', 'q_sinistri_5_anni', 'no', 1.00, 20);

------------------------------------------------------------------------
-- Multiplier bands (years_since albo)
------------------------------------------------------------------------

-- AXA: giovani più cari, esperti sconto
insert into public.product_multiplier_bands
  (product_id, question_key, calculation, range_min, range_max, multiplier, sort_order) values
  ('00000000-0000-4000-8000-000000000101', 'q_anno_iscrizione_albo', 'years_since',  0,   5, 1.20, 10),
  ('00000000-0000-4000-8000-000000000101', 'q_anno_iscrizione_albo', 'years_since',  5,  15, 1.00, 20),
  ('00000000-0000-4000-8000-000000000101', 'q_anno_iscrizione_albo', 'years_since', 15, 999, 0.95, 30),
  ('00000000-0000-4000-8000-000000000102', 'q_anno_iscrizione_albo', 'years_since',  0,   5, 1.30, 10),
  ('00000000-0000-4000-8000-000000000102', 'q_anno_iscrizione_albo', 'years_since',  5, 999, 1.00, 20);

------------------------------------------------------------------------
-- Addon prices (tutela legale — solo AXA)
------------------------------------------------------------------------

insert into public.product_addon_prices (product_id, question_key, trigger_value, price_fixed) values
  ('00000000-0000-4000-8000-000000000101', 'q_tutela_legale_opzione', 'si', 150);

------------------------------------------------------------------------
-- Scoring rules (per NL07)
------------------------------------------------------------------------

insert into public.scoring_rules
  (activity_id, question_key, operator, expected_value, score_delta, description, sort_order) values
  ('NL07', 'q_sinistri_5_anni',             'equals',   'no', 10, 'Nessun sinistro',                  10),
  ('NL07', 'q_sinistri_5_anni',             'equals',   'si', -10, 'Sinistri negli ultimi 5 anni',    20),
  ('NL07', 'q_polizza_in_corso',            'equals',   'si',  3, 'Continuità assicurativa',          30),
  ('NL07', 'q_attivita_chirurgica_estetica','equals',   'si', -5, 'Chirurgia estetica (alto rischio)', 40);

-- Scoring a banda: più di 15 anni dall'iscrizione albo → +8
insert into public.scoring_rules
  (activity_id, question_key, operator, range_min, range_max, score_delta, description, sort_order) values
  ('NL07', 'q_anno_iscrizione_albo', 'less_than', null, 2011, 8, 'Medico esperto (>=15 anni)', 50);

------------------------------------------------------------------------
-- Recommendations (safe + economic)
------------------------------------------------------------------------

insert into public.product_recommendations
  (product_id, slot, score_min, score_max, priority, reason) values
  ('00000000-0000-4000-8000-000000000101', 'safe',     10, 999, 1, 'Prodotto premium raccomandato per profili solidi'),
  ('00000000-0000-4000-8000-000000000101', 'safe',    -99,  10, 2, 'Fallback premium per profili più rischiosi'),
  ('00000000-0000-4000-8000-000000000102', 'economic', -99, 999, 1, 'Prodotto più conveniente');

commit;
