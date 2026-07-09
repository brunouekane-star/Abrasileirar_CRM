-- =====================================================================
-- Abrasileirar CRM — Phase 1: Row Level Security (RBAC)
--   admin     => full access
--   professor => reads only their assigned students / contracts / sessions,
--                and can log hours (class_sessions) for those students.
--
-- Perf: is_admin() is wrapped in (select ...) so Postgres evaluates it once
-- per query (initplan) instead of once per row.
-- =====================================================================

-- Private schema for security-definer helpers (not exposed via PostgREST)
create schema if not exists private;

-- Is the current user an admin? (security definer bypasses RLS on profiles)
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Is the given student assigned to the current user (professor)?
create or replace function private.teaches_student(p_student_id bigint)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.students
    where id = p_student_id
      and assigned_teacher_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin()               from public, anon, authenticated;
revoke execute on function private.teaches_student(bigint)  from public, anon, authenticated;
grant  execute on function private.is_admin()               to authenticated;
grant  execute on function private.teaches_student(bigint)  to authenticated;

-- ---------------------------------------------------------------------
-- Enable + force RLS on every table
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.services       enable row level security;
alter table public.companies      enable row level security;
alter table public.leads          enable row level security;
alter table public.students       enable row level security;
alter table public.contracts      enable row level security;
alter table public.class_sessions enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy profiles_admin_all on public.profiles
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------
-- services — everyone authenticated reads; only admin writes
-- ---------------------------------------------------------------------
create policy services_select_all on public.services
  for select to authenticated
  using (true);

create policy services_admin_write on public.services
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------
-- companies — admin full; professor reads companies of their students
-- ---------------------------------------------------------------------
create policy companies_admin_all on public.companies
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy companies_professor_read on public.companies
  for select to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.company_id = companies.id
        and s.assigned_teacher_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------
-- leads — sales pipeline is admin/manager only
-- ---------------------------------------------------------------------
create policy leads_admin_all on public.leads
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------
-- students — admin full; professor reads their assigned students
-- ---------------------------------------------------------------------
create policy students_admin_all on public.students
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy students_professor_read on public.students
  for select to authenticated
  using (assigned_teacher_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- contracts — admin full; professor reads contracts of their students
-- ---------------------------------------------------------------------
create policy contracts_admin_all on public.contracts
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy contracts_professor_read on public.contracts
  for select to authenticated
  using (
    student_id is not null and (select private.teaches_student(student_id))
  );

-- ---------------------------------------------------------------------
-- class_sessions — admin full; professor reads & logs hours for own students
-- ---------------------------------------------------------------------
create policy class_sessions_admin_all on public.class_sessions
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy class_sessions_professor_read on public.class_sessions
  for select to authenticated
  using (
    teacher_id = (select auth.uid())
    or (select private.teaches_student(student_id))
  );

create policy class_sessions_professor_insert on public.class_sessions
  for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and (select private.teaches_student(student_id))
  );

create policy class_sessions_professor_update on public.class_sessions
  for update to authenticated
  using (
    teacher_id = (select auth.uid())
    and (select private.teaches_student(student_id))
  )
  with check (
    teacher_id = (select auth.uid())
    and (select private.teaches_student(student_id))
  );

-- ---------------------------------------------------------------------
-- Table privileges (internal CRM: authenticated only, no anon access).
-- RLS above is what actually gates the rows; these grants let the role
-- reach the tables at all. service_role (server-side) keeps full access.
-- ---------------------------------------------------------------------
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on schema public to authenticated;

