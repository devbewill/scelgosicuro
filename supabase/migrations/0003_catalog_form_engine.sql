-- Phase B/C schema: catalog (insurers, products, variants), form bank
-- (questions, questionnaires), rules (eligibility, pricing, scoring,
-- recommendations) and engine output (quote_results).
--
-- FASE D (user_profiles, policies, payment snapshots) is intentionally
-- deferred to a later migration.
--
-- RLS: catalog + form tables are public-readable with the anon key so the
-- engine can run for unauthenticated users. Rules tables (pricing,
-- eligibility, scoring, recommendations) are also readable by anon because
-- the engine evaluates them client-adjacent in server actions without a
-- user context. quote_results is insertable by anon (server action writes
-- its own engine output into the session). Tighten later when auth lands.

------------------------------------------------------------------------
-- Catalog
------------------------------------------------------------------------

create table public.insurers (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  logo_url    text,
  website     text,
  created_at  timestamptz not null default now()
);

create table public.product_types (
  id          text primary key,
  name        text not null,
  category    text not null check (category in ('ATT', 'IMP', 'IMM')),
  created_at  timestamptz not null default now()
);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  insurer_id       uuid not null references public.insurers(id)     on delete restrict,
  product_type_id  text not null references public.product_types(id) on delete restrict,
  code             text unique not null,
  name             text not null,
  description      text,
  status           text not null default 'active' check (status in ('active', 'inactive')),
  valid_from       date not null default current_date,
  valid_until      date,
  created_at       timestamptz not null default now()
);

create index idx_products_insurer on public.products(insurer_id);
create index idx_products_type    on public.products(product_type_id);
create index idx_products_active  on public.products(status) where status = 'active';

create table public.activity_products (
  activity_id  text not null references public.activities(id) on delete restrict,
  product_id   uuid not null references public.products(id)   on delete cascade,
  is_core      boolean not null default false,
  sort_order   int not null default 0,
  primary key (activity_id, product_id)
);

create index idx_activity_products_activity on public.activity_products(activity_id);
create index idx_activity_products_product  on public.activity_products(product_id);

create table public.product_coverage_options (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  coverage_amount   numeric not null,
  deductible        numeric not null default 0,
  price_multiplier  numeric not null default 1,
  is_default        boolean not null default false,
  sort_order        int not null default 0
);

create index idx_product_coverage_product on public.product_coverage_options(product_id);

create table public.product_addons (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  code           text not null,
  name           text not null,
  description    text,
  price_fixed    numeric,
  price_percent  numeric,
  is_included    boolean not null default false,
  sort_order     int not null default 0,
  unique (product_id, code)
);

------------------------------------------------------------------------
-- Rules: eligibility, pricing, scoring, recommendations
------------------------------------------------------------------------

-- Shared operator vocabulary used across rules tables. Enforcing via CHECK
-- gives us a safety net; the engine reads operator as text.
create type rule_operator as enum (
  'equals',
  'not_equals',
  'in',
  'not_in',
  'greater_than',
  'less_than',
  'between'
);

create table public.product_eligibility_rules (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  question_key      text not null,
  operator          rule_operator not null,
  expected_value    text,
  expected_values   text[],
  range_min         numeric,
  range_max         numeric,
  exclusion_reason  text,
  sort_order        int not null default 0
);

create index idx_elig_product on public.product_eligibility_rules(product_id);

create table public.product_base_prices (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  question_key  text not null,
  answer_value  text,
  base_price    numeric not null,
  is_default    boolean not null default false,
  unique (product_id, question_key, answer_value)
);

create index idx_base_prices_product on public.product_base_prices(product_id);

create table public.product_multipliers (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  question_key  text not null,
  answer_value  text not null,
  multiplier    numeric not null,
  sort_order    int not null default 0
);

create index idx_multipliers_product on public.product_multipliers(product_id);

create table public.product_multiplier_bands (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  question_key  text not null,
  calculation   text not null check (calculation in ('direct', 'years_since', 'band')),
  range_min     numeric,
  range_max     numeric,
  multiplier    numeric not null,
  sort_order    int not null default 0
);

create index idx_bands_product on public.product_multiplier_bands(product_id);

create table public.product_addon_prices (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  question_key   text not null,
  trigger_value  text not null,
  price_fixed    numeric,
  price_percent  numeric
);

create index idx_addon_prices_product on public.product_addon_prices(product_id);

create table public.scoring_rules (
  id                uuid primary key default gen_random_uuid(),
  activity_id       text references public.activities(id)    on delete cascade,
  product_type_id   text references public.product_types(id) on delete cascade,
  question_key      text not null,
  operator          rule_operator not null,
  expected_value    text,
  expected_values   text[],
  range_min         numeric,
  range_max         numeric,
  score_delta       numeric not null,
  description       text,
  sort_order        int not null default 0,
  check (activity_id is not null or product_type_id is not null)
);

create index idx_scoring_activity on public.scoring_rules(activity_id);
create index idx_scoring_type     on public.scoring_rules(product_type_id);

create table public.product_recommendations (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  slot        text not null check (slot in ('safe', 'economic')),
  score_min   numeric not null,
  score_max   numeric not null,
  priority    int not null default 1,
  reason      text
);

create index idx_reco_lookup on public.product_recommendations(slot, score_min, score_max);

------------------------------------------------------------------------
-- Form bank
------------------------------------------------------------------------

create table public.questions (
  key         text primary key,
  label       text not null,
  help_text   text,
  type        text not null check (type in (
    'number', 'currency', 'dropdown', 'choice', 'multichoice',
    'date', 'boolean', 'text'
  )),
  options     jsonb,
  validation  jsonb,
  category    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.questionnaires (
  id            uuid primary key default gen_random_uuid(),
  activity_id   text not null references public.activities(id) on delete restrict,
  version       int  not null,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  definition    jsonb not null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (activity_id, version)
);

create index idx_questionnaires_published
  on public.questionnaires(activity_id)
  where status = 'published';

-- Link quote_sessions to the questionnaire version the user answers against,
-- so in-flight sessions finish on the version they started on even if a new
-- version is published mid-flow.
alter table public.quote_sessions
  add constraint quote_sessions_questionnaire_fk
    foreign key (questionnaire_id)
    references public.questionnaires(id)
    on delete restrict;

------------------------------------------------------------------------
-- Engine output
------------------------------------------------------------------------

create table public.quote_results (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.quote_sessions(id) on delete cascade,
  product_id        uuid not null references public.products(id)       on delete restrict,
  annual_price      numeric,
  monthly_price     numeric,
  coverage_snapshot jsonb,
  excluded          boolean not null default false,
  excluded_reason   text,
  slot              text check (slot in ('safe', 'economic')),
  created_at        timestamptz not null default now(),
  unique (session_id, product_id)
);

create index idx_results_session on public.quote_results(session_id);

------------------------------------------------------------------------
-- RLS + grants (anon + authenticated read catalog/rules/form, write results)
------------------------------------------------------------------------

alter table public.insurers                 enable row level security;
alter table public.product_types            enable row level security;
alter table public.products                 enable row level security;
alter table public.activity_products        enable row level security;
alter table public.product_coverage_options enable row level security;
alter table public.product_addons           enable row level security;
alter table public.product_eligibility_rules enable row level security;
alter table public.product_base_prices      enable row level security;
alter table public.product_multipliers      enable row level security;
alter table public.product_multiplier_bands enable row level security;
alter table public.product_addon_prices     enable row level security;
alter table public.scoring_rules            enable row level security;
alter table public.product_recommendations  enable row level security;
alter table public.questions                enable row level security;
alter table public.questionnaires           enable row level security;
alter table public.quote_results            enable row level security;

create policy insurers_read                 on public.insurers                 for select to anon, authenticated using (true);
create policy product_types_read            on public.product_types            for select to anon, authenticated using (true);
create policy products_read                 on public.products                 for select to anon, authenticated using (true);
create policy activity_products_read        on public.activity_products        for select to anon, authenticated using (true);
create policy product_coverage_read         on public.product_coverage_options for select to anon, authenticated using (true);
create policy product_addons_read           on public.product_addons           for select to anon, authenticated using (true);
create policy product_eligibility_read      on public.product_eligibility_rules for select to anon, authenticated using (true);
create policy product_base_prices_read      on public.product_base_prices      for select to anon, authenticated using (true);
create policy product_multipliers_read      on public.product_multipliers      for select to anon, authenticated using (true);
create policy product_multiplier_bands_read on public.product_multiplier_bands for select to anon, authenticated using (true);
create policy product_addon_prices_read     on public.product_addon_prices     for select to anon, authenticated using (true);
create policy scoring_rules_read            on public.scoring_rules            for select to anon, authenticated using (true);
create policy product_recommendations_read  on public.product_recommendations  for select to anon, authenticated using (true);
create policy questions_read                on public.questions                for select to anon, authenticated using (true);
-- Only published questionnaires are visible to the public; drafts stay internal.
create policy questionnaires_read           on public.questionnaires           for select to anon, authenticated using (status = 'published');

create policy quote_results_insert on public.quote_results for insert to anon, authenticated with check (true);
create policy quote_results_read   on public.quote_results for select to anon, authenticated using (true);

-- Also allow updating quote_sessions (user_score, status, selected_product_id, questionnaire_id, answers).
-- Pre-auth: permissive. Later we'll scope by session ownership token or auth.uid().
create policy quote_sessions_read   on public.quote_sessions for select to anon, authenticated using (true);
create policy quote_sessions_update on public.quote_sessions for update to anon, authenticated using (true) with check (true);

grant select on public.insurers                 to anon, authenticated;
grant select on public.product_types            to anon, authenticated;
grant select on public.products                 to anon, authenticated;
grant select on public.activity_products        to anon, authenticated;
grant select on public.product_coverage_options to anon, authenticated;
grant select on public.product_addons           to anon, authenticated;
grant select on public.product_eligibility_rules to anon, authenticated;
grant select on public.product_base_prices      to anon, authenticated;
grant select on public.product_multipliers      to anon, authenticated;
grant select on public.product_multiplier_bands to anon, authenticated;
grant select on public.product_addon_prices     to anon, authenticated;
grant select on public.scoring_rules            to anon, authenticated;
grant select on public.product_recommendations  to anon, authenticated;
grant select on public.questions                to anon, authenticated;
grant select on public.questionnaires           to anon, authenticated;
grant select, insert on public.quote_results    to anon, authenticated;
grant select, update on public.quote_sessions   to anon, authenticated;
