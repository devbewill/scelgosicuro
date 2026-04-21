-- Migration 0004: align cloud DB to new questions model
-- Cloud had old LLM-branch 0002/0003 applied; this migration replaces that state.

-- =====================================================
-- Clean up old tables from LLM branch
-- =====================================================

DROP TABLE IF EXISTS sector_questions    CASCADE;
DROP TABLE IF EXISTS questions           CASCADE;
DROP TABLE IF EXISTS product_questions   CASCADE;
DROP TABLE IF EXISTS professions         CASCADE;

-- Clean up old seed data (delete in FK-safe order)
DELETE FROM quote_results;
DELETE FROM quote_sessions;
DELETE FROM product_eligibility_rules;
DELETE FROM product_multipliers;
DELETE FROM product_addon_rate_rows;
DELETE FROM product_addons;
DELETE FROM product_rate_rows;
DELETE FROM product_coverages;
DELETE FROM products;
DELETE FROM insurers;
DELETE FROM sectors;

-- =====================================================
-- sector_questions — self-contained (no bank join)
-- =====================================================

CREATE TABLE sector_questions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sector_id   BIGINT NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  help_text   TEXT,
  type        TEXT NOT NULL CHECK (type IN ('dropdown','number','text','boolean','date','multiselect')),
  options     JSONB,
  validation  JSONB,
  position    INT NOT NULL DEFAULT 0,
  section     TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  visible_if  JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sector_id, key)
);

CREATE INDEX idx_sector_questions_order ON sector_questions(sector_id, position);

CREATE TRIGGER trg_sector_questions_updated
  BEFORE UPDATE ON sector_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- professions — sector-scoped dropdown
-- =====================================================

CREATE TABLE professions (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sector_id     BIGINT NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sector_id, slug)
);

CREATE INDEX idx_professions_sector ON professions(sector_id) WHERE is_active;

CREATE TRIGGER trg_professions_updated
  BEFORE UPDATE ON professions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- product_questions — product-specific questions
-- =====================================================

CREATE TABLE product_questions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  help_text   TEXT,
  type        TEXT NOT NULL CHECK (type IN ('dropdown','number','text','boolean','date','multiselect')),
  options     JSONB,
  validation  JSONB,
  position    INT NOT NULL DEFAULT 0,
  section     TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  visible_if  JSONB,
  phase       TEXT NOT NULL DEFAULT 'pricing' CHECK (phase IN ('eligibility','pricing','addon')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, key)
);

CREATE INDEX idx_product_questions_order ON product_questions(product_id, position);

CREATE TRIGGER trg_product_questions_updated
  BEFORE UPDATE ON product_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- is_estimate on quote_results
-- =====================================================

ALTER TABLE quote_results
  ADD COLUMN IF NOT EXISTS is_estimate BOOLEAN NOT NULL DEFAULT FALSE;

-- =====================================================
-- Re-seed: settore Medici — 3 prodotti AmTrust
-- =====================================================

INSERT INTO sectors (slug, name, description, display_order)
VALUES ('medici', 'Medici', 'RC Professionale per medici e specialisti sanitari', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO professions (sector_id, slug, name, display_order)
SELECT s.id, p.slug, p.name, p.ord
FROM sectors s,
(VALUES
  ('medico_generico',           'Medico di Medicina Generale (MMG)',  1),
  ('pediatra',                  'Pediatra',                           2),
  ('specialista_ambulatoriale', 'Specialista Ambulatoriale',          3),
  ('chirurgo',                  'Chirurgo',                           4),
  ('specializzando',            'Specializzando',                     5)
) AS p(slug, name, ord)
WHERE s.slug = 'medici'
ON CONFLICT (sector_id, slug) DO NOTHING;

INSERT INTO insurers (slug, name)
VALUES ('amtrust', 'AmTrust Europe')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id, p.slug, p.name, p.descr, '1.0', true
FROM insurers i, sectors s,
(VALUES
  ('amtrust-medico-protetto',
   'AmTrust Medico Protetto',
   'RC Professionale per medici liberi professionisti (anche SSN convenzionato)'),
  ('amtrust-colpa-grave-extra',
   'AmTrust Colpagrave Extra',
   'RC Colpa Grave per medici dipendenti SSN e strutture private.'),
  ('amtrust-medico-under-35',
   'AmTrust Medico Under 35',
   'RC Professionale entry-level per medici liberi professionisti fino a 35 anni')
) AS p(slug, name, descr)
WHERE i.slug = 'amtrust' AND s.slug = 'medici'
ON CONFLICT (insurer_id, slug, version) DO NOTHING;

-- sector_questions
INSERT INTO sector_questions (sector_id, key, label, type, options, position, is_required)
SELECT s.id, q.key, q.label, q.type, q.options::jsonb, q.pos, true
FROM sectors s,
(VALUES
  ('q_tipo_assicurato_medico', 'Tipo di assicurato', 'dropdown',
   '[{"value":"libero_prof","label":"Libero professionista"},{"value":"dipendente","label":"Dipendente SSN / struttura privata"}]', 1),
  ('q_eta', 'Età', 'number', NULL, 2),
  ('q_sinistri_5_anni', 'Numero di sinistri negli ultimi 5 anni', 'number', NULL, 3),
  ('q_massimale_rc', 'Massimale RC richiesto', 'dropdown',
   '[{"value":1000000,"label":"€ 1.000.000"},{"value":2000000,"label":"€ 2.000.000"},{"value":3000000,"label":"€ 3.000.000"},{"value":5000000,"label":"€ 5.000.000"}]', 4)
) AS q(key, label, type, options, pos)
WHERE s.slug = 'medici'
ON CONFLICT (sector_id, key) DO NOTHING;

-- product_questions — Medico Protetto
INSERT INTO product_questions (product_id, key, label, type, options, position, is_required, phase)
SELECT p.id, q.key, q.label, q.type, q.options::jsonb, q.pos, true, q.phase::text
FROM products p,
(VALUES
  ('q_gruppo_rischio_medico', 'Gruppo di rischio', 'dropdown',
   '[{"value":"grp1","label":"Gruppo 1 – Med. Generale / Pediatria"},{"value":"grp2","label":"Gruppo 2 – Medicina Interna"},{"value":"grp3","label":"Gruppo 3 – Anestesia / Rianimazione"},{"value":"grp4","label":"Gruppo 4 – Ostetricia / Ginecologia"},{"value":"grp5","label":"Gruppo 5 – Chirurgia Generale"},{"value":"grp6","label":"Gruppo 6 – Chirurgia Specialistica"},{"value":"grp7","label":"Gruppo 7 – Ortopedia"},{"value":"grp8","label":"Gruppo 8 – Neurochirurgia"},{"value":"grp9","label":"Gruppo 9 – Cardiochirurgia"}]',
   1, 'pricing'),
  ('q_attivita_struttura', 'Attività in struttura', 'dropdown',
   '[{"value":"no","label":"Solo studio privato"},{"value":"si","label":"Anche in struttura convenzionata / privata"}]',
   2, 'pricing'),
  ('q_franchigia_medico', 'Franchigia', 'dropdown',
   '[{"value":5000,"label":"€ 5.000"},{"value":10000,"label":"€ 10.000"},{"value":25000,"label":"€ 25.000"}]',
   3, 'pricing')
) AS q(key, label, type, options, pos, phase)
WHERE p.slug = 'amtrust-medico-protetto'
ON CONFLICT (product_id, key) DO NOTHING;

-- product_questions — Colpagrave Extra
INSERT INTO product_questions (product_id, key, label, type, options, position, is_required, phase)
SELECT p.id, q.key, q.label, q.type, q.options::jsonb, q.pos, true, q.phase::text
FROM products p,
(VALUES
  ('q_categoria_rischio_cg', 'Categoria di rischio', 'dropdown',
   '[{"value":"cod_01","label":"Cod. 01 – Rischio Basso"},{"value":"cod_02","label":"Cod. 02 – Rischio Medio-Basso"},{"value":"cod_03","label":"Cod. 03 – Rischio Medio"},{"value":"cod_04","label":"Cod. 04 – Rischio Medio-Alto"},{"value":"cod_05","label":"Cod. 05 – Rischio Alto"}]',
   1, 'pricing'),
  ('q_retroattivita_rc', 'Retroattività RC', 'dropdown',
   '[{"value":"10_anni","label":"10 anni"},{"value":"illimitata","label":"Illimitata"}]',
   2, 'pricing')
) AS q(key, label, type, options, pos, phase)
WHERE p.slug = 'amtrust-colpa-grave-extra'
ON CONFLICT (product_id, key) DO NOTHING;

-- coverages
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id, c.key, c.name, true, c.dims::jsonb
FROM products p,
(VALUES
  ('amtrust-medico-protetto',   'rc_professionale', 'RC Professionale',  '["q_gruppo_rischio_medico","q_massimale_rc"]'),
  ('amtrust-colpa-grave-extra', 'rc_colpa_grave',   'RC Colpa Grave',    '["q_categoria_rischio_cg","q_massimale_rc","q_retroattivita_rc"]'),
  ('amtrust-medico-under-35',   'rc_under35',       'RC Under 35',       '["q_massimale_rc"]')
) AS c(slug, key, name, dims)
WHERE p.slug = c.slug
ON CONFLICT DO NOTHING;

-- rate_rows — Medico Protetto (9 gruppi × 4 massimali = 36 rows → subset 18)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_gruppo_rischio_medico', r.grp, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id
CROSS JOIN (VALUES
  ('grp1', 1000000,  480),
  ('grp1', 2000000,  720),
  ('grp2', 1000000,  600),
  ('grp2', 2000000,  900),
  ('grp3', 1000000,  900),
  ('grp3', 2000000, 1350),
  ('grp4', 1000000, 1200),
  ('grp4', 2000000, 1800),
  ('grp5', 1000000,  960),
  ('grp5', 2000000, 1440),
  ('grp6', 1000000, 1440),
  ('grp6', 2000000, 2160),
  ('grp7', 1000000, 1080),
  ('grp7', 2000000, 1620),
  ('grp8', 1000000, 1800),
  ('grp8', 2000000, 2700),
  ('grp9', 1000000, 2400),
  ('grp9', 2000000, 3600)
) AS r(grp, mass, premium)
WHERE p.slug = 'amtrust-medico-protetto' AND cov.key = 'rc_professionale'
ON CONFLICT DO NOTHING;

-- rate_rows — Colpagrave Extra (5 categorie × 4 massimali × 2 retroattività = 40)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_categoria_rischio_cg', r.cat, 'q_massimale_rc', r.mass, 'q_retroattivita_rc', r.retro),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id
CROSS JOIN (VALUES
  ('cod_01', 1000000, '10_anni',    320),
  ('cod_01', 1000000, 'illimitata', 420),
  ('cod_01', 2000000, '10_anni',    480),
  ('cod_01', 2000000, 'illimitata', 630),
  ('cod_02', 1000000, '10_anni',    480),
  ('cod_02', 1000000, 'illimitata', 630),
  ('cod_02', 2000000, '10_anni',    720),
  ('cod_02', 2000000, 'illimitata', 945),
  ('cod_03', 1000000, '10_anni',    720),
  ('cod_03', 1000000, 'illimitata', 945),
  ('cod_03', 2000000, '10_anni',   1080),
  ('cod_03', 2000000, 'illimitata',1418),
  ('cod_04', 1000000, '10_anni',   1080),
  ('cod_04', 1000000, 'illimitata',1418),
  ('cod_04', 2000000, '10_anni',   1620),
  ('cod_04', 2000000, 'illimitata',2126),
  ('cod_05', 1000000, '10_anni',   1620),
  ('cod_05', 1000000, 'illimitata',2126),
  ('cod_05', 2000000, '10_anni',   2430),
  ('cod_05', 2000000, 'illimitata',3189),
  ('cod_01', 3000000, '10_anni',    640),
  ('cod_01', 3000000, 'illimitata', 840),
  ('cod_01', 5000000, '10_anni',    960),
  ('cod_01', 5000000, 'illimitata',1260),
  ('cod_02', 3000000, '10_anni',    960),
  ('cod_02', 3000000, 'illimitata',1260),
  ('cod_02', 5000000, '10_anni',   1440),
  ('cod_02', 5000000, 'illimitata',1890),
  ('cod_03', 3000000, '10_anni',   1440),
  ('cod_03', 3000000, 'illimitata',1890),
  ('cod_03', 5000000, '10_anni',   2160),
  ('cod_03', 5000000, 'illimitata',2835),
  ('cod_04', 3000000, '10_anni',   2160),
  ('cod_04', 3000000, 'illimitata',2835),
  ('cod_04', 5000000, '10_anni',   3240),
  ('cod_04', 5000000, 'illimitata',4253),
  ('cod_05', 3000000, '10_anni',   3240),
  ('cod_05', 3000000, 'illimitata',4253),
  ('cod_05', 5000000, '10_anni',   4860),
  ('cod_05', 5000000, 'illimitata',6378)
) AS r(cat, mass, retro, premium)
WHERE p.slug = 'amtrust-colpa-grave-extra' AND cov.key = 'rc_colpa_grave'
ON CONFLICT DO NOTHING;

-- rate_rows — Under 35 (fasce età × massimale)
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id
CROSS JOIN (VALUES
  (1000000, 290),
  (2000000, 435)
) AS r(mass, premium)
WHERE p.slug = 'amtrust-medico-under-35' AND cov.key = 'rc_under35'
ON CONFLICT DO NOTHING;

-- eligibility rules
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, r.name, r.cond::jsonb, r.action, r.reason, r.prio
FROM products p
CROSS JOIN (VALUES
  ('amtrust-medico-protetto', 'Solo liberi professionisti',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"libero_prof"}',
   'exclude', 'Questo prodotto è riservato ai liberi professionisti', 10),
  ('amtrust-medico-protetto', 'Max 2 sinistri in 5 anni',
   '{"op":"less_than_or_equal","key":"q_sinistri_5_anni","value":2}',
   'exclude', 'Più di 2 sinistri negli ultimi 5 anni: preventivo manuale', 20),
  ('amtrust-colpa-grave-extra', 'Solo dipendenti SSN/struttura',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"dipendente"}',
   'exclude', 'Questo prodotto è riservato ai medici dipendenti SSN o struttura privata', 10),
  ('amtrust-medico-under-35', 'Solo liberi professionisti',
   '{"op":"equals","key":"q_tipo_assicurato_medico","value":"libero_prof"}',
   'exclude', 'Questo prodotto è riservato ai liberi professionisti', 10),
  ('amtrust-medico-under-35', 'Solo under 35',
   '{"op":"less_than_or_equal","key":"q_eta","value":35}',
   'exclude', 'Questo prodotto è disponibile solo fino a 35 anni', 20)
) AS r(slug, name, cond, action, reason, prio)
WHERE p.slug = r.slug
ON CONFLICT DO NOTHING;

-- multipliers — franchigia Medico Protetto
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, cov.id, m.name, m.factor, m.cond::jsonb, m.prio
FROM products p
JOIN product_coverages cov ON cov.product_id = p.id AND cov.key = 'rc_professionale'
CROSS JOIN (VALUES
  ('Franchigia € 10.000', 0.92, '{"op":"equals","key":"q_franchigia_medico","value":10000}', 10),
  ('Franchigia € 25.000', 0.85, '{"op":"equals","key":"q_franchigia_medico","value":25000}', 10),
  ('Attività in struttura', 1.15, '{"op":"equals","key":"q_attivita_struttura","value":"si"}', 20)
) AS m(name, factor, cond, prio)
WHERE p.slug = 'amtrust-medico-protetto'
ON CONFLICT DO NOTHING;
