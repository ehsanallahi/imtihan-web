<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A (Initial creation)
- Added sections: Core Principles (Stack, Security, Roles, Localization, Integrations), Governance
- Removed sections: N/A
- Templates requiring updates:
  ⚠ .specify/templates/plan-template.md
  ⚠ .specify/templates/spec-template.md
  ⚠ .specify/templates/tasks-template.md
- Follow-up TODOs: Ensure spec templates are customized.
-->

# Imtihan Constitution

## Core Principles

### I. Stack Alignment & Technology
Always use Next.js App Router, Javascript, and Tailwind CSS. Components should be built using `shadcn/ui`. Use Supabase PostgreSQL as the database and NextAuth v5 for authentication.

### II. Data Access & Security
Always use Prisma ORM for database operations. Never use raw SQL.
Always check role permission via Casbin before every API route. 

### III. Roles and Privacy Constraints
Roles: `student`, `guardian`, `teacher`, `institution_admin`, `content_editor`, `moderator`, `marketer`, `support_agent`, `finance_manager`, `super_admin`.
Never expose user PII (Personally Identifiable Information) to `marketer` or `content_editor` roles.

### IV. Localization and Design
The primary language of the UI is English with Urdu text support (specifically using Noto Nastaliq font).
Colors: Teal (#1aab7a) is the primary color, and Gold (#e6a817) is the accent color.

### V. External Integrations
Payments: JazzCash + EasyPaisa only. No Stripe.
AI: Gemini API is the exclusive provider. (Use `gemini-1.5-flash` for MCQs, `gemini-1.5-pro` for doubt solver).

## Roles & Permissions Matrix
Given the complexity of the platform (student, guardian, teacher, institution_admin, content_editor, moderator, marketer, support_agent, finance_manager, super_admin), Casbin will act as the single source of truth for ABAC/RBAC logic.

## Governance
This Constitution supersedes all other practices and acts as the ultimate truth for code generation and PR reviews.
Amendments require documentation, approval, and a migration plan if changing core dependencies or security practices.

**Version**: 1.0.0 | **Ratified**: 2026-04-16 | **Last Amended**: 2026-04-16
