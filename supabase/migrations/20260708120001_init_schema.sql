-- =====================================================================
-- Abrasileirar CRM — Phase 1: Core schema
-- Postgres / Supabase. Language: identifiers & comments in English.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums (type-safe, well-defined domains)
-- ---------------------------------------------------------------------
create type user_role        as enum ('admin', 'professor');
create type client_type      as enum ('b2b', 'b2c');
create type lead_stage       as enum (
  'lead', 'first_contact', 'proposal_sent', 'negotiation', 'won', 'lost'
);
create type proficiency_level as enum ('a1', 'a2', 'b1', 'b2', 'c1', 'c2');
create type contract_status  as enum ('active', 'completed', 'expired', 'cancelled');
create type session_status   as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type service_modality as enum ('intensive', 'regular', 'exam_prep', 'workshop', 'mentoring');

-- ---------------------------------------------------------------------
-- Generic helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles — extends Supabase auth.users with app role & data (RBAC)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        user_role not null default 'professor',
  email       text,
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever an auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- services — product catalog (see referencias/servicos.md)
-- ---------------------------------------------------------------------
create table public.services (
  id           bigint generated always as identity primary key,
  code         text not null unique,
  name         text not null,
  modality     service_modality not null,
  locations    text[] not null default '{}',        -- e.g. {MG,SP,RJ,online}
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- companies — B2B accounts
-- ---------------------------------------------------------------------
create table public.companies (
  id           bigint generated always as identity primary key,
  name         text not null,
  cnpj         text,
  industry     text,
  country      text,
  contact_name text,
  email        text,
  phone        text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- leads — sales pipeline (Kanban). B2B leads may reference a company.
-- ---------------------------------------------------------------------
create table public.leads (
  id               bigint generated always as identity primary key,
  type             client_type not null,
  stage            lead_stage not null default 'lead',
  contact_name     text not null,
  company_id       bigint references public.companies (id) on delete set null,
  company_name     text,                                   -- free text before company is created
  email            text,
  phone            text,                                   -- phone / WhatsApp
  nationality      text,
  native_language  text,
  service_id       bigint references public.services (id) on delete set null,
  estimated_value  numeric(12,2),
  owner_id         uuid references public.profiles (id) on delete set null,
  notes            text,
  lost_reason      text,
  converted_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index leads_company_id_idx on public.leads (company_id);
create index leads_service_id_idx on public.leads (service_id);
create index leads_owner_id_idx   on public.leads (owner_id);
create index leads_stage_idx      on public.leads (stage);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- students — individual learners.
--   company_id NULL  => B2C (individual)
--   company_id SET   => B2B (employee linked to a corporate account)
-- ---------------------------------------------------------------------
create table public.students (
  id                  bigint generated always as identity primary key,
  full_name           text not null,
  email               text,
  phone               text,
  nationality         text,
  native_language     text,
  company_id          bigint references public.companies (id) on delete set null,
  proficiency_level   proficiency_level,
  assigned_teacher_id uuid references public.profiles (id) on delete set null,
  cultural_notes      text,
  is_active           boolean not null default true,
  source_lead_id      bigint references public.leads (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index students_company_id_idx          on public.students (company_id);
create index students_assigned_teacher_id_idx on public.students (assigned_teacher_id);
create index students_source_lead_id_idx      on public.students (source_lead_id);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- contracts — hours bank (RF04). Tied to a company (B2B) and/or student.
-- consumed_hours is maintained by a trigger from completed class sessions.
-- ---------------------------------------------------------------------
create table public.contracts (
  id              bigint generated always as identity primary key,
  service_id      bigint not null references public.services (id) on delete restrict,
  company_id      bigint references public.companies (id) on delete cascade,
  student_id      bigint references public.students (id) on delete cascade,
  total_hours     numeric(7,2) not null check (total_hours >= 0),
  consumed_hours  numeric(7,2) not null default 0 check (consumed_hours >= 0),
  remaining_hours numeric(7,2) generated always as (total_hours - consumed_hours) stored,
  total_value     numeric(12,2) not null default 0,
  monthly_value   numeric(12,2),                          -- recurring amount => feeds MRR
  status          contract_status not null default 'active',
  start_date      date not null default current_date,
  end_date        date,
  source_lead_id  bigint references public.leads (id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint contracts_party_required
    check (company_id is not null or student_id is not null)
);

create index contracts_service_id_idx     on public.contracts (service_id);
create index contracts_company_id_idx     on public.contracts (company_id);
create index contracts_student_id_idx     on public.contracts (student_id);
create index contracts_source_lead_id_idx on public.contracts (source_lead_id);
create index contracts_status_idx         on public.contracts (status);

create trigger contracts_set_updated_at
  before update on public.contracts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- class_sessions — lessons; each completed session consumes contract hours.
-- ---------------------------------------------------------------------
create table public.class_sessions (
  id              bigint generated always as identity primary key,
  contract_id     bigint not null references public.contracts (id) on delete cascade,
  student_id      bigint not null references public.students (id) on delete cascade,
  teacher_id      uuid references public.profiles (id) on delete set null,
  session_date    timestamptz not null default now(),
  duration_hours  numeric(5,2) not null check (duration_hours > 0),
  status          session_status not null default 'completed',
  topic           text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index class_sessions_contract_id_idx on public.class_sessions (contract_id);
create index class_sessions_student_id_idx  on public.class_sessions (student_id);
create index class_sessions_teacher_id_idx  on public.class_sessions (teacher_id);
create index class_sessions_date_idx        on public.class_sessions (session_date);

create trigger class_sessions_set_updated_at
  before update on public.class_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Keep contracts.consumed_hours in sync with completed sessions
-- ---------------------------------------------------------------------
-- security definer: the recalc UPDATE must bypass RLS so a professor logging
-- hours (who has no write access to contracts) still updates consumed_hours.
create or replace function public.recalc_contract_hours(p_contract_id bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.contracts c
  set consumed_hours = coalesce((
    select sum(cs.duration_hours)
    from public.class_sessions cs
    where cs.contract_id = p_contract_id
      and cs.status = 'completed'
  ), 0)
  where c.id = p_contract_id;
$$;

create or replace function public.class_sessions_sync_hours()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalc_contract_hours(old.contract_id);
    return old;
  end if;

  perform public.recalc_contract_hours(new.contract_id);
  -- if a session moved between contracts, refresh the old one too
  if tg_op = 'UPDATE' and new.contract_id is distinct from old.contract_id then
    perform public.recalc_contract_hours(old.contract_id);
  end if;
  return new;
end;
$$;

create trigger class_sessions_sync_hours_trg
  after insert or update or delete on public.class_sessions
  for each row execute function public.class_sessions_sync_hours();

-- ---------------------------------------------------------------------
-- convert_lead — turn a won lead into client records (RF03)
--   Creates company (if B2B and none linked) + student, marks lead won.
--   Contract is created afterwards in the UI. Returns the new student id.
-- ---------------------------------------------------------------------
create or replace function public.convert_lead(p_lead_id bigint)
returns bigint
language plpgsql
as $$
declare
  v_lead       public.leads%rowtype;
  v_company_id bigint;
  v_student_id bigint;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'Lead % not found', p_lead_id;
  end if;

  v_company_id := v_lead.company_id;

  -- B2B without a linked company yet: create one from the lead
  if v_lead.type = 'b2b' and v_company_id is null then
    insert into public.companies (name, contact_name, email, phone)
    values (
      coalesce(nullif(v_lead.company_name, ''), v_lead.contact_name),
      v_lead.contact_name, v_lead.email, v_lead.phone
    )
    returning id into v_company_id;
  end if;

  insert into public.students (
    full_name, email, phone, nationality, native_language,
    company_id, source_lead_id
  )
  values (
    v_lead.contact_name, v_lead.email, v_lead.phone,
    v_lead.nationality, v_lead.native_language,
    v_company_id, v_lead.id
  )
  returning id into v_student_id;

  update public.leads
  set stage = 'won', company_id = v_company_id, converted_at = now()
  where id = p_lead_id;

  return v_student_id;
end;
$$;
