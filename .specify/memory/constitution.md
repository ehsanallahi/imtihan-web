<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles:
    I.  Stack Alignment & Technology — tightened "should" → MUST; clarified NextAuth v5 API pattern
    II. Data Access & Security — added password hashing rule, secrets management, migration discipline
    III. Roles and Privacy Constraints — unchanged (wording only)
    IV. Localization and Design — unchanged
    V.  External Integrations — unchanged
- Added sections: Roles & Permissions Matrix (populated), Governance (versioning policy + amendment procedure)
- Removed sections: N/A
- Templates requiring updates:
    ✅ .specify/templates/plan-template.md — Constitution Check section is runtime-driven; no hardcoded changes needed
    ✅ .specify/templates/spec-template.md — Technology-agnostic; no changes needed
    ✅ .specify/templates/tasks-template.md — Generic task structure; no changes needed
    ⚠  README.md — Still the default create-next-app README; should be replaced with Imtihan project description
- Follow-up TODOs:
    - TODO(README): Replace boilerplate README with Imtihan platform overview, setup guide, and env-var reference
    - TODO(CASBIN_SEED): Define and commit initial Casbin policy file for all roles
    - TODO(RATIFICATION_DATE): Confirm original ratification date (recorded as 2026-04-16 from prior commit)
-->

# Imtihan Constitution

## Core Principles

### I. Stack Alignment & Technology

The Imtihan platform MUST be built using the following stack — no alternatives are
permitted without a formal amendment:

- **Framework**: Next.js App Router (JavaScript, not TypeScript unless amended)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui — all interactive components MUST come from this library
- **Database**: Supabase-hosted PostgreSQL
- **Authentication**: NextAuth v5 (`next-auth@^5`). The v5 API pattern MUST be used:
  export a named `{ auth, signIn, signOut, handlers }` from a top-level `auth.js`
  configuration file, NOT the v4 `authOptions` object pattern.
- **ORM**: Prisma (see Principle II)

**Rationale**: A single mandatory stack eliminates decision fatigue, ensures all
contributors work with the same mental model, and allows AI-assisted code generation
to apply consistent patterns without ambiguity.

### II. Data Access & Security

All database operations MUST go through Prisma ORM. Raw SQL queries are prohibited.

Schema changes MUST be introduced via Prisma migration files (`prisma migrate dev`).
Migrations MUST be committed to source control alongside the code that depends on them.

All API routes MUST check role-based permissions via Casbin before processing any
request. A reusable middleware helper MUST be used for this check — inline permission
logic duplicated across routes is not permitted.

Passwords MUST be stored as one-way cryptographic hashes (bcrypt or argon2).
Plaintext passwords MUST never be written to or read from the database.

All secrets (API keys, database credentials, `AUTH_SECRET`) MUST be loaded from
environment variables. Secrets MUST NOT be committed to source control. The `.env.local`
file is git-ignored and MUST contain real values in every environment.

**Rationale**: Centralising data access through Prisma and security enforcement through
Casbin creates two single points of truth that are easy to audit. Mandatory migrations
prevent schema drift between environments.

### III. Roles and Privacy Constraints

The platform recognises exactly ten roles. Adding or removing a role requires a
constitution amendment and a Casbin policy migration:

`student` · `guardian` · `teacher` · `institution_admin` · `content_editor` ·
`moderator` · `marketer` · `support_agent` · `finance_manager` · `super_admin`

User PII (name, email, phone, CNIC, address) MUST NOT be exposed in any response
returned to a `marketer` or `content_editor` principal. Casbin policy MUST enforce
this at the API layer, not only in the frontend.

**Rationale**: Defining roles in the constitution — not in application code — ensures
that new routes and features inherit the access model rather than defining their own.

### IV. Localization and Design

The primary UI language is English. Urdu text MUST be rendered using the
**Noto Nastaliq Urdu** font; no substitution is permitted.

**Brand palette (non-negotiable)**:

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1aab7a` (Teal) | CTAs, active states, links |
| Accent | `#e6a817` (Gold) | Highlights, badges, secondary CTA |

All new pages MUST be responsive and support both LTR (English) and RTL (Urdu) text
direction using the CSS `dir` attribute.

**Rationale**: Consistent brand colours and font choices across all contributors
eliminate design inconsistency without requiring a full design-system review on every PR.

### V. External Integrations

**Payments**: JazzCash and EasyPaisa ONLY. Stripe and other international gateways are
explicitly prohibited until a formal amendment is approved.

**AI**: Gemini API is the exclusive AI provider:
- MCQ generation: `gemini-1.5-flash`
- Doubt solver / long-form reasoning: `gemini-1.5-pro`

**File storage**: Cloudinary (PDFs, images). No alternative storage providers.

**Email**: Resend (transactional email). No SMTP or other providers.

**Rationale**: Limiting integrations to providers that are approved for the Pakistani
market reduces compliance risk and vendor-management overhead.

## Roles & Permissions Matrix

Casbin acts as the single source of truth for all ABAC/RBAC decisions. The table
below defines the high-level access boundaries; the canonical policy lives in the
Casbin policy file committed to the repository.

| Role | Read own data | Read others' data | Create content | Moderate | Finance | Admin |
|---|---|---|---|---|---|---|
| `student` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `guardian` | ✅ | 👶 children only | ❌ | ❌ | ❌ | ❌ |
| `teacher` | ✅ | 🏫 own students | ✅ exams | ❌ | ❌ | ❌ |
| `institution_admin` | ✅ | 🏫 own institution | ✅ | ✅ institution | ❌ | ❌ |
| `content_editor` | ✅ | ❌ PII hidden | ✅ content | ❌ | ❌ | ❌ |
| `moderator` | ✅ | ✅ non-PII | ❌ | ✅ | ❌ | ❌ |
| `marketer` | ✅ | ❌ PII hidden | ❌ | ❌ | ❌ | ❌ |
| `support_agent` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `finance_manager` | ✅ | 💰 finance only | ❌ | ❌ | ✅ | ❌ |
| `super_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Note**: Fine-grained object-level rules (e.g., a teacher can only modify their
> own exam) are defined in the Casbin policy file, not in application code.

## Governance

### Amendment Procedure

1. Open a pull request that modifies this file **and** includes:
   - A completed Sync Impact Report (top-of-file HTML comment)
   - Updates to any templates or code paths affected by the principle change
   - A Casbin policy migration file if roles or PII rules changed
2. Obtain approval from the project lead before merging
3. Increment the version according to semantic versioning (see below)

### Versioning Policy

Constitution versions follow semantic versioning:

| Change type | Bump | Examples |
|---|---|---|
| Remove or redefine a principle | **MAJOR** | Replacing Prisma with raw SQL, dropping a role |
| Add a new principle or materially expand guidance | **MINOR** | New integration rule, new security requirement |
| Clarifications, typos, wording only | **PATCH** | Grammar fix, rewording without semantic change |

### Compliance Review

Constitution compliance MUST be verified:
- During every pull-request review (Constitution Check gate in plan.md)
- Before every production deployment
- After every dependency version bump that touches a principle-named library

**Version**: 1.1.0 | **Ratified**: 2026-04-16 | **Last Amended**: 2026-04-17
