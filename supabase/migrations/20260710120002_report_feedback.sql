-- =====================================================================
-- Abrasileirar CRM — Feedback por critério nos relatórios de desempenho.
-- Guarda { "<criterio>": "<texto>" } (ex: { "fala": "...", "eng_tarefas": "..." }).
-- =====================================================================

alter table public.student_reports
  add column feedback jsonb not null default '{}'::jsonb;
