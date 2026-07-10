# Relatório de Desempenho do Aluno — Plano de Implementação

**Goal:** Módulo de relatório de desempenho por aluno/período (frequência, habilidades
PLE em radar, engajamento, recomendações), visto no app e imprimível.

**Arquitetura:** 2 tabelas Supabase (student_reports + report_absences) com RLS; server
actions; formulário e visualização em Next.js App Router; gráficos SVG/CSS puro.

**Verificação:** cada tarefa termina com `npm run build` limpo; verificação end-to-end
final no navegador (criar relatório → visualizar → imprimir) + limpeza dos dados de teste.

## Restrições globais
- Base UI: todo `Select` com prop `items` (rótulos PT).
- Migration aplicada pelo Bruno no SQL Editor.
- Deploy automático via `git push`.
- Escala 1–5; legenda: 1 Raramente · 2 Quando solicitado · 3 Regularmente · 4 Sempre · 5 Com excelência.

---

### Task 1 — Migration (tabelas + RLS)
- Create: `supabase/migrations/20260710120001_student_reports.sql`
- student_reports (student_id, teacher_id, period_start/end, total_aulas, 5 habilidades
  1–5, 4 engajamento 1–5, recomendacoes, timestamps + trigger updated_at).
- report_absences (report_id, data, conteudo, repor, created_at).
- Índices nas FKs + period_start. RLS: admin total; professor via teaches_student.
- [ ] Escrever migration. [ ] Bruno aplica no SQL Editor. [ ] Verificar com script (insert/select).

### Task 2 — Tipos e rótulos
- Modify: `src/lib/types.ts` (StudentReport, ReportAbsence).
- Create: `src/lib/reports.ts` (SKILL_LABELS, ENGAGEMENT_LABELS, RATING_LEGEND, helpers
  de média e frequência).
- [ ] Build limpo.

### Task 3 — Server actions
- Create: `src/lib/actions/reports.ts`: `saveReport(input)` (cria/atualiza + substitui
  faltas; valida admin/professor), `deleteReport(id)`. Zod.
- [ ] Build limpo.

### Task 4 — RatingInput (1–5)
- Create: `src/components/reports/rating-input.tsx` (segmentado 1–5, controlado).
- [ ] Build limpo.

### Task 5 — Gráficos SVG
- Create: `src/components/reports/radar-chart.tsx` (pentágono 5 eixos, escala 1–5).
- Create: `src/components/reports/frequency-donut.tsx` (rosca/gauge com %).
- [ ] Build limpo.

### Task 6 — ReportForm
- Create: `src/components/reports/report-form.tsx` (período, habilidades, engajamento,
  frequência com faltas dinâmicas, recomendações; chama saveReport).
- [ ] Build limpo.

### Task 7 — Páginas de formulário
- Create: `src/app/(app)/alunos/[id]/relatorios/novo/page.tsx` (criar).
- Create: `src/app/(app)/relatorios/[id]/editar/page.tsx` (editar).
- [ ] Build limpo.

### Task 8 — Visualização do relatório
- Create: `src/app/(app)/relatorios/[id]/page.tsx` (KPIs, radar, rosca, barras,
  recomendações, botão Imprimir/PDF).
- Modify: `src/app/globals.css` (@media print: ocultar sidebar/topbar).
- Modify: `src/app/(app)/layout.tsx` se necessário (marcar áreas print-hide).
- [ ] Build limpo.

### Task 9 — Integração na página do Aluno
- Modify: `src/app/(app)/alunos/[id]/page.tsx` — seção "Relatórios de desempenho"
  (lista + "Novo relatório").
- [ ] Build limpo.

### Task 10 — Verificação final
- [ ] Commit + push (deploy). [ ] Navegador: criar relatório, visualizar, imprimir.
- [ ] Limpar dados de teste. [ ] Atualizar memória.
