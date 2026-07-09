-- =====================================================================
-- Abrasileirar CRM — Seed data
-- Service catalog from referencias/servicos.md (official site).
-- Idempotent: safe to re-run.
-- =====================================================================

insert into public.services (code, name, modality, locations, description) values
  ('IMERSAO',
   'Programa de Imersão em Língua, Cultura e Mercado',
   'intensive', '{MG,SP}',
   'Curso intensivo com dedicação exclusiva para estrangeiros que vêm ao Brasil como parte do treinamento para o trabalho no país.'),
  ('REGULAR',
   'Programa Regular',
   'regular', '{MG,SP,RJ,online}',
   'Aulas regulares que desenvolvem habilidades comunicativas e conhecimento de cultura e mercado brasileiros.'),
  ('CELPE_BRAS',
   'Programa CELPE-Bras',
   'exam_prep', '{MG,SP,RJ,online}',
   'Aulas regulares para preparação ao exame de proficiência Celpe-Bras.'),
  ('WORKSHOP_INTERCULTURAL',
   'Workshops Interculturais',
   'workshop', '{MG,SP,RJ,online}',
   'Aulas, workshops e mentorias para o desenvolvimento da consciência intercultural e integração de equipes multiculturais.'),
  ('ABREX',
   'ABRex — Mentoria de Mercado Brasileiro',
   'mentoring', '{online}',
   'Sessões de videoconferência (individuais ou em grupo) sobre setores, economia, legislação e ambientes corporativos brasileiros.')
on conflict (code) do update set
  name        = excluded.name,
  modality    = excluded.modality,
  locations   = excluded.locations,
  description = excluded.description;
