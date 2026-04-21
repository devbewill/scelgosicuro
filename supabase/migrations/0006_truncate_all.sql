-- Migration 0006: svuota tutti i dati (mantiene lo schema)
TRUNCATE TABLE
  quote_results,
  quote_sessions,
  product_eligibility_rules,
  product_multipliers,
  product_addon_rate_rows,
  product_addons,
  product_rate_rows,
  product_coverages,
  product_questions,
  products,
  professions,
  sector_questions,
  insurers,
  sectors
RESTART IDENTITY CASCADE;
