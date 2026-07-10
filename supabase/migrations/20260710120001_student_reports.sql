-- =====================================================================
-- Abrasileirar CRM — Relatório de Desempenho do Aluno (PLE)
-- Tabelas: student_reports + report_absences (com RLS).
-- =====================================================================

-- ---------------------------------------------------------------------
-- student_reports — um relatório por aluno/período
-- ---------------------------------------------------------------------
create table public.student_reports (
  id               bigint generated always as identity primary key,
  student_id       bigint not null references public.students (id) on delete cascade,
  teacher_id       uuid references public.profiles (id) on delete set null,
  period_start     date not null,
  period_end       date not null,
  total_aulas      int not null default 0 check (total_aulas >= 0),
  -- Desenvolvimento (habilidades PLE), escala 1-5
  fala             smallint check (fala between 1 and 5),
  audicao          smallint check (audicao between 1 and 5),
  leitura          smallint check (leitura between 1 and 5),
  escrita          smallint check (escrita between 1 and 5),
  gramatica        smallint check (gramatica between 1 and 5),
  -- Engajamento, escala 1-5
  eng_participacao smallint check (eng_participacao between 1 and 5),
  eng_tarefas      smallint check (eng_tarefas between 1 and 5),
  eng_pratica      smallint check (eng_pratica between 1 and 5),
  eng_assiduidade  smallint check (eng_assiduidade between 1 and 5),
  recomendacoes    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index student_reports_student_id_idx   on public.student_reports (student_id);
create index student_reports_teacher_id_idx   on public.student_reports (teacher_id);
create index student_reports_period_start_idx on public.student_reports (period_start);

create trigger student_reports_set_updated_at
  before update on public.student_reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- report_absences — faltas de um relatório
-- ---------------------------------------------------------------------
create table public.report_absences (
  id          bigint generated always as identity primary key,
  report_id   bigint not null references public.student_reports (id) on delete cascade,
  data        date,
  conteudo    text,
  repor       boolean not null default false,
  created_at  timestamptz not null default now()
);

create index report_absences_report_id_idx on public.report_absences (report_id);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.student_reports enable row level security;
alter table public.report_absences enable row level security;

-- student_reports: admin total; professor gerencia relatórios dos seus alunos
create policy student_reports_admin_all on public.student_reports
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy student_reports_prof_select on public.student_reports
  for select to authenticated
  using ((select private.teaches_student(student_id)));

create policy student_reports_prof_insert on public.student_reports
  for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and (select private.teaches_student(student_id))
  );

create policy student_reports_prof_update on public.student_reports
  for update to authenticated
  using ((select private.teaches_student(student_id)))
  with check ((select private.teaches_student(student_id)));

-- report_absences: admin total; professor gerencia faltas dos relatórios dos seus alunos
create policy report_absences_admin_all on public.report_absences
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy report_absences_prof_all on public.report_absences
  for all to authenticated
  using (
    exists (
      select 1 from public.student_reports r
      where r.id = report_absences.report_id
        and (select private.teaches_student(r.student_id))
    )
  )
  with check (
    exists (
      select 1 from public.student_reports r
      where r.id = report_absences.report_id
        and (select private.teaches_student(r.student_id))
    )
  );

-- Privilégios (CRM interno: apenas authenticated)
grant select, insert, update, delete on public.student_reports to authenticated;
grant select, insert, update, delete on public.report_absences to authenticated;
