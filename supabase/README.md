# Banco de Dados — Abrasileirar CRM (Supabase)

Schema da **Fase 1**: modelo de dados completo + RLS (RBAC) + catálogo de serviços.

## Estrutura

```
supabase/
├── migrations/
│   ├── 20260708120001_init_schema.sql   ← enums, tabelas, índices, triggers, funções
│   └── 20260708120002_rls_policies.sql  ← RLS: admin (total) x professor (seus alunos)
└── seed.sql                             ← catálogo de serviços (5 programas)
```

## Modelo de dados

```
profiles (extends auth.users, role: admin|professor)
services (catálogo)
companies (B2B) 1─* students
leads ──convert_lead()──► students (+ company se B2B)
contracts (banco de horas)  ─* class_sessions (consomem horas)
   • consumed_hours mantido por trigger a partir de sessões 'completed'
   • remaining_hours = total_hours - consumed_hours (coluna gerada)
```

**Papéis (RBAC via RLS):**
- **admin** → acesso total a tudo.
- **professor** → lê apenas seus alunos, contratos e sessões; pode lançar horas
  (`class_sessions`) para alunos atribuídos a ele.

## Como aplicar

### Opção A — Supabase CLI (recomendado)
```bash
supabase link --project-ref <SEU_PROJECT_REF>
supabase db push          # aplica as migrations
supabase db reset         # (local) recria do zero + roda seed.sql
```

### Opção B — SQL Editor do painel Supabase
Cole e execute, na ordem:
1. `migrations/20260708120001_init_schema.sql`
2. `migrations/20260708120002_rls_policies.sql`
3. `seed.sql`

## Notas
- O primeiro usuário criado vira `professor` por padrão. Para promover a admin:
  ```sql
  update public.profiles set role = 'admin' where email = 'voce@exemplo.com';
  ```
- `convert_lead(lead_id)` converte um lead ganho em cliente/aluno (RF03) e retorna
  o `id` do aluno criado; o contrato é criado em seguida pela interface.
