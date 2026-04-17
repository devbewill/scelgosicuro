-- Explicit RLS policies for Phase A.
-- Re-creates policies with explicit role targets (anon, authenticated) so that
-- the supabase-js publishable/anon key can read sectors/activities and insert
-- quote_sessions. Pre-auth: no ownership scoping yet — will be tightened once
-- Supabase Auth is wired in FASE D.

drop policy if exists sectors_read    on public.sectors;
drop policy if exists activities_read on public.activities;
drop policy if exists quote_insert    on public.quote_sessions;

create policy sectors_read
  on public.sectors
  for select
  to anon, authenticated
  using (true);

create policy activities_read
  on public.activities
  for select
  to anon, authenticated
  using (true);

create policy quote_insert
  on public.quote_sessions
  for insert
  to anon, authenticated
  with check (true);

-- Ensure table-level grants exist (Supabase usually grants these via event
-- trigger on new tables, but being explicit is safe and idempotent).
grant select on public.sectors        to anon, authenticated;
grant select on public.activities     to anon, authenticated;
grant insert on public.quote_sessions to anon, authenticated;
