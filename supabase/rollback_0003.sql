-- Rollback per 0003_catalog_form_engine.sql.
-- Esegui questo script nel SQL editor di Supabase PRIMA di ri-applicare 0003,
-- se una migrazione parziale ha lasciato oggetti creati (es. errore 42P07).

-- Rimuovi il FK aggiunto su quote_sessions (se presente).
alter table public.quote_sessions
  drop constraint if exists quote_sessions_questionnaire_fk;

-- Drop tabelle in ordine inverso rispetto ai riferimenti FK.
drop table if exists public.quote_results              cascade;
drop table if exists public.questionnaires             cascade;
drop table if exists public.questions                  cascade;
drop table if exists public.product_recommendations    cascade;
drop table if exists public.scoring_rules              cascade;
drop table if exists public.product_addon_prices       cascade;
drop table if exists public.product_multiplier_bands   cascade;
drop table if exists public.product_multipliers        cascade;
drop table if exists public.product_base_prices        cascade;
drop table if exists public.product_eligibility_rules  cascade;
drop table if exists public.product_addons             cascade;
drop table if exists public.product_coverage_options   cascade;
drop table if exists public.activity_products          cascade;
drop table if exists public.products                   cascade;
drop table if exists public.product_types              cascade;
drop table if exists public.insurers                   cascade;

-- Rimuovi l'enum condiviso dalle rule tables.
drop type if exists rule_operator;

-- Rimuovi anche le policy di quote_sessions aggiunte da 0003 (le ri-crea
-- la migrazione al prossimo giro).
drop policy if exists quote_sessions_read   on public.quote_sessions;
drop policy if exists quote_sessions_update on public.quote_sessions;
