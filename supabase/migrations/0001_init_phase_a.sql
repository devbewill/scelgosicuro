-- Phase A schema: sectors, activities, quote_sessions.
-- Later migrations add: questions, questionnaires, products, pricing rules, policies.

create extension if not exists "pgcrypto";

create table public.sectors (
  id          text primary key,
  name        text not null,
  icon        text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.activities (
  id          text primary key,
  sector_id   text not null references public.sectors(id) on delete restrict,
  name        text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_activities_sector on public.activities(sector_id);

create table public.quote_sessions (
  id                  uuid primary key default gen_random_uuid(),
  activity_id         text not null references public.activities(id) on delete restrict,
  questionnaire_id    uuid,
  contact_name        text not null,
  contact_email       text not null,
  contact_phone       text not null,
  answers             jsonb not null default '{}'::jsonb,
  user_score          numeric,
  status              text not null default 'draft',
  selected_product_id uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_quote_sessions_activity on public.quote_sessions(activity_id);
create index idx_quote_sessions_email    on public.quote_sessions(contact_email);

alter table public.sectors        enable row level security;
alter table public.activities     enable row level security;
alter table public.quote_sessions enable row level security;

create policy sectors_read    on public.sectors        for select using (true);
create policy activities_read on public.activities     for select using (true);
create policy quote_insert    on public.quote_sessions for insert with check (true);
