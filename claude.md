# Project: Abrasileirar CRM

## 1. Context & Business Overview
**Abrasileirar** is a specialized training and education company focused on teaching Portuguese as a second language, providing Intercultural Training, and educating foreign professionals, multinational teams, and international companies about the Brazilian market.

### Target Audience
* **B2B:** Multinational corporations with multicultural teams operating in or moving to Brazil.
* **B2C:** Foreign executives, expats, and professionals seeking integration into the Brazilian market and culture.

---

## 2. Core Features & Requirements

### Lead & Client Management (CRM Pipeline)
* **Pipeline Stages:** Lead -> First Contact -> Proposal Sent -> Negotiation -> Closed Won (Active Client) -> Closed Lost -> Churn.
* **Client Segmentation:** Toggle/Filter between **B2B (Corporate)** and **B2C (Individual)** profiles.
* **Corporate Hierarchy:** Ability to link multiple individual students (employees) to a single corporate client (B2B).

### Service & Course Tracking
* **Product Catalog:** Portuguese Classes, Intercultural Training, Brazilian Market Onboarding.
* **Contract Management:** Track active hours, total hours contracted vs. hours consumed, and contract expiration dates.
* **Student Progress Quick-View:** Status of classes, assigned teachers, and schedule overview.

### Financial & Dashboard Metrics
* MRR (Monthly Recurring Revenue) & Total Revenue.
* Conversion rate per pipeline stage.
* Active students vs. pending proposals.

---

## 3. Technical Stack (Proposed)
* **Frontend:** React (Next.js or Vite) with Tailwind CSS & Shadcn/ui (Clean, modern UI matching the colorful yet professional logo identity).
* **Backend/Database:** Node.js (TypeScript) with Prisma ORM and PostgreSQL (or Supabase for rapid deployment).
* **Authentication:** NextAuth or Supabase Auth.

---

## 4. Design Guidelines & System Persona
* **UI Persona:** Professional, welcoming, organized, and culturally vibrant. Use the logo colors (Greens, Yellows, Teals, and Purples) as accent colors against a clean, readable background.
* **Language:** The CRM interface should be in Portuguese (or dual-language EN/PT if requested later), but codebase documentation/logs should remain in English.
* **Brand slogan:** *língua, cultura e mercado* — the three business pillars.

### Reference material (read before UI/brand or catalog work)
Real data extracted from the official site + logo. Always read these before writing
brand-facing copy, seeding the service catalog, or choosing colors:
* `referencias/marca.md` — brand voice, slogan, color palette.
* `referencias/servicos.md` — service catalog (5 programs) for the Contract module.
* `referencias/contato.md` — company contact data (footer / seed).

---

## 5. Development Roadmap & Rules for Claude Code
1.  **Phase 1:** Database Schema Definition (Prisma/PostgreSQL models for Users, Leads, Companies, Contracts, Classes).
2.  **Phase 2:** Authentication and Layout Shell (Sidebar, Navigation, Theming).
3.  **Phase 3:** Lead Pipeline View (Kanban Board style for B2B/B2C leads).
4.  **Phase 4:** Client & Student Management Profiles.
5.  **Phase 5:** Financial Dashboard & Analytics.

### Code Quality Rules
* Write modular, reusable React components.
* Ensure strict TypeScript types for all database models and API responses.
* Validate all forms using Zod or a similar validation library.