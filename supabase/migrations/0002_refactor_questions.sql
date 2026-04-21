-- Migration 0002: refactor questions model
-- Eliminates the shared `questions` bank; makes sector_questions a full table;
-- adds professions and product_questions; adds is_estimate to quote_results.

-- =====================================================
-- Drop old pivot tables (no production data yet)
-- =====================================================

DROP TABLE IF EXISTS sector_questions CASCADE;
DROP TABLE IF EXISTS questions          CASCADE;

-- =====================================================
-- sector_questions — full table (no join to bank)
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
-- professions — dropdown passo 1 (sector-scoped)
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
-- product_questions — domande specifiche per prodotto
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
-- quote_results — add is_estimate flag
-- =====================================================

ALTER TABLE quote_results
  ADD COLUMN IF NOT EXISTS is_estimate BOOLEAN NOT NULL DEFAULT FALSE;
