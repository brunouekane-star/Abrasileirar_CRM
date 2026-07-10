# Relatório de Desempenho do Aluno (PLE) — Design

Data: 2026-07-10
Status: Aprovado (aguardando revisão do spec)

## 1. Visão geral

Novo módulo de **relatório de desempenho por aluno e por período**, inspirado no
Mister Wiz mas adaptado para **PLE (Português como Língua Estrangeira)** e público
**adulto/profissional**. O relatório é preenchido pelo professor e anexado ao aluno
que já existe no CRM. Não altera o CRM de vendas/contratos.

Escopo aprovado:
- **Só o relatório do aluno** (sem camada de "Turmas").
- Seções: **Frequência + Desenvolvimento (habilidades PLE) + Engajamento + Recomendações**
  (sem "Comportamento/regras da sala").
- Frequência **manual** por relatório (não puxa das aulas do contrato).
- Relatório **visto no app + imprimível em PDF** (via impressão do navegador). Sem
  envio automático por e-mail nesta versão.
- Gráficos em **SVG/CSS puro** (radar, rosca, barras), sem bibliotecas — padrão já
  usado no Dashboard.
- Paleta da marca Abrasileirar (roxo/verde), não o roxo do Mister Wiz.

## 2. Modelo de dados (Supabase / Postgres)

Duas tabelas novas. Migration aplicada pelo Bruno no SQL Editor (padrão do projeto).

### `public.student_reports`
Um registro por relatório (aluno + período).

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | bigint identity PK | |
| student_id | bigint FK students(id) on delete cascade | |
| teacher_id | uuid FK profiles(id) on delete set null | quem emitiu |
| period_start | date | início do período avaliado |
| period_end | date | fim do período |
| total_aulas | int not null default 0 check (>= 0) | total de aulas no período |
| fala | smallint check (1..5) | habilidade (nullable) |
| audicao | smallint check (1..5) | |
| leitura | smallint check (1..5) | |
| escrita | smallint check (1..5) | |
| gramatica | smallint check (1..5) | |
| eng_participacao | smallint check (1..5) | engajamento (nullable) |
| eng_tarefas | smallint check (1..5) | |
| eng_pratica | smallint check (1..5) | |
| eng_assiduidade | smallint check (1..5) | |
| recomendacoes | text | recomendações do professor |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() (trigger) | |

Índices: `student_id`, `teacher_id`, `period_start`.

### `public.report_absences`
Faltas de um relatório (0..N).

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | bigint identity PK | |
| report_id | bigint FK student_reports(id) on delete cascade | |
| data | date | data da falta |
| conteudo | text | conteúdo da aula perdida |
| repor | boolean not null default false | será reposta? |
| created_at | timestamptz default now() | |

Índice: `report_id`.

**Frequência (%)** = round((total_aulas − nº de faltas) / total_aulas × 100).
Se `total_aulas = 0` → exibir "—" (sem porcentagem).

### RLS
Seguindo o padrão do projeto (helpers em `private`):
- `student_reports`:
  - admin: acesso total.
  - professor: select/insert/update onde `private.teaches_student(student_id)`;
    `teacher_id` deve ser o próprio usuário no insert.
- `report_absences`:
  - admin: acesso total.
  - professor: gerenciar onde existe `student_reports r` com `r.id = report_id` e
    `private.teaches_student(r.student_id)`.

## 3. Critérios e escala

Escala **1–5** em tudo. Legenda: **1 Raramente · 2 Quando solicitado · 3 Regularmente
· 4 Sempre · 5 Com excelência**.

- **Desenvolvimento (radar):** Fala, Audição, Leitura, Escrita, Gramática.
- **Engajamento (barras):** Participação nas aulas, Realização de tarefas, Prática
  fora da aula, Assiduidade.

## 4. Telas e rotas

- **Aluno** (`/alunos/[id]`): nova seção **"Relatórios de desempenho"** — lista de
  relatórios do aluno (período + link) + botão **"Novo relatório"**.
- **Criar relatório**: `/alunos/[id]/relatorios/novo`.
- **Editar relatório**: `/relatorios/[id]/editar`.
- **Ver relatório** (renderizado): `/relatorios/[id]`.

### Formulário (criar/editar)
- Período (period_start / period_end; default: mês corrente).
- Habilidades (Fala/Audição/Leitura/Escrita/Gramática): seletor segmentado **1–5**.
- Engajamento (4 critérios): seletor segmentado **1–5**.
- Frequência: `total_aulas` + linhas de falta dinâmicas (data + conteúdo + "repor")
  com "+ Adicionar falta".
- Recomendações (textarea).
- Salvar → grava o relatório e substitui a lista de faltas.

### Relatório renderizado (`/relatorios/[id]`)
- Cabeçalho: nome do aluno, professor, período.
- **3 cards de KPI**: Frequência %, Desenvolvimento (média das 5 habilidades, 1 casa),
  Engajamento (média dos 4 critérios, 1 casa).
- **Radar** (SVG pentágono) das 5 habilidades.
- **Rosca/gauge** de frequência (%).
- **Barras** de engajamento (x/5).
- Recomendações do professor.
- Botão **"Imprimir / PDF"** (`window.print()`), com CSS `@media print` que oculta
  sidebar/topbar e imprime só o relatório.

## 5. Componentes

- `RatingInput` (client): seletor segmentado 1–5 reutilizável (habilidades + engajamento).
- `RadarChart` (SVG): pentágono com 5 eixos, escala 1–5, cor da marca.
- `FrequencyDonut` (SVG): rosca/gauge com a %.
- Barras de engajamento: reaproveitar padrão de barra (estilo `HoursBar`/dashboard).
- `ReportForm` (client): formulário completo (habilidades, engajamento, frequência,
  faltas dinâmicas, recomendações).
- Layout de visualização do relatório (server) + print styles.

## 6. Server actions (`src/lib/actions/reports.ts`)

- `saveReport(input)`: cria ou atualiza um `student_reports` + **substitui** as faltas
  (`report_absences`). Valida admin ou professor-do-aluno. Retorna o id.
- `deleteReport(id)`: exclui o relatório (faltas caem por cascade).

Validação com Zod (habilidades/engajamento 1–5 ou nulos; total_aulas >= 0; período).

## 7. Fora de escopo (YAGNI nesta versão)

- Turmas/agrupamento de alunos.
- Frequência automática a partir de `class_sessions`.
- Envio do relatório por e-mail.
- Campo de feedback por critério (só há um bloco de recomendações). Pode ser
  adicionado depois.
- Workflow de rascunho/publicação (relatório é sempre editável).

## 8. Notas de implementação

- Padrão Base UI: `Select` sempre com prop `items` (rótulos PT).
- Migration nova em `supabase/migrations/`, aplicada pelo Bruno no SQL Editor.
- Deploy automático via `git push` (Vercel).
