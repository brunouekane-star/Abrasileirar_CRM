# Product Requirement Document (PRD) — Abrasileirar CRM

## 1. Visão Geral do Produto
O CRM da Abrasileirar é uma plataforma web interna projetada para centralizar, organizar e otimizar o pipeline de vendas e a gestão de contratos de alunos corporativos (B2B) e individuais (B2C) focados no ensino de Língua Portuguesa, Treinamento Intercultural e Educação sobre o Mercado Brasileiro.

---

## 2. Personas (Usuários do Sistema)
* **Administrador / Gestor Comercial:** Responsável por cadastrar leads, movimentar o pipeline, aprovar propostas, associar professores aos alunos e analisar o faturamento.
* **Professor / Facilitador:** Visualiza a agenda de aulas, registra horas consumidas e atualiza o progresso dos alunos a ele atribuídos.

---

## 3. Requisitos Funcionais (Funcionalidades)

### RF01 – Autenticação e Níveis de Acesso
* O sistema deve possuir login seguro via e-mail e senha.
* Controle de acesso baseado em papéis (RBAC): Administrador (acesso total) e Professor (apenas visualização de seus alunos e lançamento de horas).

### RF02 – Gestão de Leads e Funil de Vendas (Pipeline)
* **Visualização em Kanban:** Exibição gráfica dos leads nas etapas: *Lead, Primeiro Contato, Proposta Enviada, Negociação, Ganho (Closed Won), Perdido (Closed Lost).*
* **Diferenciação B2B / B2C:** Cada lead deve ser marcado obrigatoriamente como "Corporativo" (B2B) ou "Individual" (B2C).
* **Campos do Lead:** Nome do contato, Nome da Empresa (se B2B), E-mail, Telefone/WhatsApp, Nacionalidade do(s) aluno(s), Idioma nativo e Produto de Interesse.

### RF03 – Cadastro e Perfil do Cliente (Pós-Venda)
* Ao marcar um lead como **Ganho (Closed Won)**, o sistema deve convertê-lo automaticamente em **Cliente Ativo**.
* **Estrutura Corporativa (B2B):** Uma "Empresa" pode ter múltiplos "Alunos/Executivos" vinculados a ela.
* **Perfil do Aluno:** Histórico de aulas, nível de proficiência em português (A1, A2, etc.), professor responsável e observações culturais importantes.

### RF04 – Gestão de Contratos e Horas (O Core Operacional)
* **Catálogo de Serviços:** Cadastro de pacotes (ex: *Curso de Português Regular, Workshop Intercultural de Mercado Brasileiro*).
* **Banco de Horas:** Controle do total de horas contratadas vs. horas já consumidas (ex: Contrato de 40h / Consumidas 12h).
* **Alertas:** Notificar visualmente no dashboard quando um contrato estiver com menos de 5 horas restantes para expirar ou renovar.

### RF05 – Dashboard e Métricas Financeiras
* **Faturamento Mensal (MRR):** Valor recorrente dos contratos ativos.
* **Taxa de Conversão:** Porcentagem de leads que viram clientes.
* **Métricas de Volume:** Total de alunos ativos e total de propostas pendentes na semana/mês.

---

## 4. Requisitos Não-Funcionais
* **Interface (UI/UX):** Design limpo, intuitivo e responsivo. Cores baseadas na identidade visual da marca (Verdes, Amarelos, Azuis/Teal e Roxos da logo), transmitindo brasilidade de forma corporativa e elegante.
* **Segurança:** Senhas criptografadas no banco de dados e validação de dados em todas as rotas (backend).
* **Performance:** Tempo de carregamento das listagens e do Kanban inferior a 1.5 segundos.

---

## 5. Modelo de Dados Simplificado (Entidades Relacionais)

```
[Company (B2B)] 1 ------- * [Student (Alunos)]
                                  |
                                  | 1
                                  *
[Lead] --------(Ganhou)-----> [Contract] (Horas Contratadas vs. Consumidas)
```

---

## 6. Critérios de Aceite para o MVP (Mínimo Produto Viável)
* [ ] Conseguir criar leads e arrastá-los ao longo das colunas do Kanban.
* [ ] Converter automaticamente um Lead Ganho em Cliente (B2B ou B2C) e abrir a tela de criação do Contrato.
* [ ] Visualizar em um gráfico simples na tela inicial o faturamento total e as horas consumidas do mês.
* [ ] Permitir que o gestor ou professor decremente as horas de um contrato conforme as aulas acontecem.
