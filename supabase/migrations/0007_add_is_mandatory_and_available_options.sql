-- Migration 0007: aggiungi is_mandatory a sector_questions, available_options a quote_results

ALTER TABLE sector_questions
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE quote_results
  ADD COLUMN IF NOT EXISTS available_options JSONB;
