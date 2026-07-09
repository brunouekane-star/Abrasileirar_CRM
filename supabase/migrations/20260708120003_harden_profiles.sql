-- =====================================================================
-- Abrasileirar CRM — Hardening: prevent self privilege-escalation.
-- A user may edit their own profile (name, phone, avatar) but must NOT be
-- able to change their own `role` or `is_active` — only admins can.
-- =====================================================================

create or replace function public.enforce_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and not private.is_admin() then
    raise exception 'Somente administradores podem alterar papel ou status ativo.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_privileged_fields on public.profiles;

create trigger profiles_enforce_privileged_fields
  before update on public.profiles
  for each row execute function public.enforce_profile_privileged_fields();
