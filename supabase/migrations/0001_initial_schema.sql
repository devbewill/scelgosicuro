-- scelgosicuro initial schema
-- Sector-scoped forms + insurer-agnostic pricing engine.

-- =====================================================
-- Clean slate (safe re-run)
-- =====================================================

DROP TABLE IF EXISTS policies                      CASCADE;
DROP TABLE IF EXISTS quote_results                 CASCADE;
DROP TABLE IF EXISTS quote_sessions                CASCADE;
DROP TABLE IF EXISTS product_eligibility_rules     CASCADE;
DROP TABLE IF EXISTS product_addon_rate_rows       CASCADE;
DROP TABLE IF EXISTS product_addons                CASCADE;
DROP TABLE IF EXISTS product_multipliers           CASCADE;
DROP TABLE IF EXISTS product_rate_rows             CASCADE;
DROP TABLE IF EXISTS product_coverages             CASCADE;
DROP TABLE IF EXISTS sector_product_recommendations CASCADE;
DROP TABLE IF EXISTS sector_scoring_rules          CASCADE;
DROP TABLE IF EXISTS sector_questions              CASCADE;
DROP TABLE IF EXISTS questions                     CASCADE;
DROP TABLE IF EXISTS products                      CASCADE;
DROP TABLE IF EXISTS insurers                      CASCADE;
DROP TABLE IF EXISTS sectors                       CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()           CASCADE;

-- vecchie tabelle da schema precedente
DROP TABLE IF EXISTS product_multiplier_bands  CASCADE;
DROP TABLE IF EXISTS product_base_prices       CASCADE;
DROP TABLE IF EXISTS product_addon_prices      CASCADE;
DROP TABLE IF EXISTS scoring_rules             CASCADE;
DROP TABLE IF EXISTS product_recommendations   CASCADE;
DROP TABLE IF EXISTS activity_products         CASCADE;
DROP TABLE IF EXISTS activities                CASCADE;
DROP TABLE IF EXISTS questionnaires            CASCADE;
DROP TABLE IF EXISTS quote_form_submissions    CASCADE;

-- =====================================================
-- Catalog: sectors, insurers, products
-- =====================================================

CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurer_id UUID NOT NULL REFERENCES insurers(id) ON DELETE RESTRICT,
  sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  source_pdf TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (insurer_id, slug, version)
);

CREATE INDEX idx_products_sector_active ON products(sector_id) WHERE is_active;
CREATE INDEX idx_products_insurer       ON products(insurer_id);

-- =====================================================
-- Form: questions + sector_questions (composition)
-- =====================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  help_text TEXT,
  type TEXT NOT NULL CHECK (type IN ('dropdown','number','text','boolean','date','multiselect')),
  options JSONB,
  validation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sector_questions (
  sector_id   UUID NOT NULL REFERENCES sectors(id)   ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  position    INT NOT NULL,
  section     TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  visible_if  JSONB,
  PRIMARY KEY (sector_id, question_id)
);

CREATE INDEX idx_sector_questions_order ON sector_questions(sector_id, position);

-- =====================================================
-- Scoring + recommendations (per settore)
-- =====================================================

CREATE TABLE sector_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id   UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  condition   JSONB NOT NULL,
  score_delta INT NOT NULL,
  category    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scoring_rules_sector ON sector_scoring_rules(sector_id);

CREATE TABLE sector_product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id  UUID NOT NULL REFERENCES sectors(id)  ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slot       TEXT NOT NULL CHECK (slot IN ('safe','economic')),
  min_score  INT,
  max_score  INT,
  priority   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (min_score IS NULL OR max_score IS NULL OR min_score <= max_score)
);

CREATE INDEX idx_recommendations_lookup ON sector_product_recommendations(sector_id, slot, priority);

-- =====================================================
-- Pricing: coverages, rate rows, multipliers, addons
-- =====================================================

CREATE TABLE product_coverages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  name         TEXT NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  available_if JSONB,
  dimensions   JSONB NOT NULL DEFAULT '[]'::jsonb,
  position     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, key)
);

CREATE INDEX idx_coverages_product ON product_coverages(product_id);

CREATE TABLE product_rate_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coverage_id      UUID NOT NULL REFERENCES product_coverages(id) ON DELETE CASCADE,
  dimension_values JSONB NOT NULL,
  premium          NUMERIC(12,2),
  manual_quote     BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (manual_quote = TRUE OR premium IS NOT NULL)
);

CREATE INDEX idx_rate_rows_coverage   ON product_rate_rows(coverage_id);
CREATE INDEX idx_rate_rows_dimensions ON product_rate_rows USING GIN (dimension_values);

CREATE TABLE product_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id)           ON DELETE CASCADE,
  coverage_id UUID          REFERENCES product_coverages(id)  ON DELETE CASCADE,
  name        TEXT NOT NULL,
  factor      NUMERIC(8,4) NOT NULL,
  condition   JSONB NOT NULL,
  priority    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_multipliers_product  ON product_multipliers(product_id);
CREATE INDEX idx_multipliers_coverage ON product_multipliers(coverage_id);

CREATE TABLE product_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  name         TEXT NOT NULL,
  pricing_mode TEXT NOT NULL CHECK (pricing_mode IN ('flat','rate_table')),
  flat_premium NUMERIC(12,2),
  triggered_by JSONB,
  available_if JSONB,
  dimensions   JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, key),
  CHECK (
    (pricing_mode = 'flat'       AND flat_premium IS NOT NULL) OR
    (pricing_mode = 'rate_table' AND dimensions   IS NOT NULL)
  )
);

CREATE INDEX idx_addons_product ON product_addons(product_id);

CREATE TABLE product_addon_rate_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id         UUID NOT NULL REFERENCES product_addons(id) ON DELETE CASCADE,
  dimension_values JSONB NOT NULL,
  premium          NUMERIC(12,2),
  manual_quote     BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (manual_quote = TRUE OR premium IS NOT NULL)
);

CREATE INDEX idx_addon_rates_addon ON product_addon_rate_rows(addon_id);

-- =====================================================
-- Eligibility (per prodotto)
-- =====================================================

CREATE TABLE product_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  condition  JSONB NOT NULL,
  action     TEXT NOT NULL CHECK (action IN ('exclude','manual_quote')),
  reason     TEXT,
  priority   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eligibility_product ON product_eligibility_rules(product_id);

-- =====================================================
-- Sessions, results, policies
-- =====================================================

CREATE TABLE quote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id     UUID NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
  form_snapshot JSONB,
  contact       JSONB,
  answers       JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_score    INT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed','bound','abandoned')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_sector ON quote_sessions(sector_id);
CREATE INDEX idx_sessions_status ON quote_sessions(status);

CREATE TABLE quote_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES quote_sessions(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id)       ON DELETE RESTRICT,
  slot              TEXT CHECK (slot IN ('safe','economic')),
  premium_total     NUMERIC(12,2),
  premium_breakdown JSONB,
  manual_quote      BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, product_id)
);

CREATE INDEX idx_results_session ON quote_results(session_id);

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id               UUID NOT NULL REFERENCES quote_sessions(id) ON DELETE RESTRICT,
  quote_result_id          UUID NOT NULL REFERENCES quote_results(id)  ON DELETE RESTRICT,
  product_snapshot         JSONB NOT NULL,
  form_snapshot            JSONB NOT NULL,
  bound_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_payment_intent_id TEXT UNIQUE,
  pdf_url                  TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- updated_at helper
-- =====================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sectors_updated   BEFORE UPDATE ON sectors       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated  BEFORE UPDATE ON products      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON questions     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sessions_updated  BEFORE UPDATE ON quote_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
