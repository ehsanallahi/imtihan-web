# Implementation Plan: Refactor Authentication Module

**Branch**: `001-refactor-auth` | **Date**: 2026-04-17 | **Spec**: [spec.md](file:///f:/Work/imtihan/imtihan-web/specs/001-refactor-auth/spec.md)
**Input**: Feature specification from `/specs/001-refactor-auth/spec.md`

## Summary

Refactor the authentication module to replace the hardcoded demo bypass with a secure, production-ready system using NextAuth v5, Prisma, and bcrypt. The new system will validate credentials against real database records and embed user roles in the session for downstream RBAC enforcement via Casbin.

## Technical Context

**Language/Version**: JavaScript (Next.js 16)  
**Primary Dependencies**: `next-auth@^5.0.0-beta.31`, `@auth/prisma-adapter`, `bcryptjs`, `casbin`, `prisma`  
**Storage**: Supabase PostgreSQL via Prisma  
**Testing**: Manual sign-in/out verification; API route protection tests  
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web Application  
**Performance Goals**: <200ms authentication latency  
**Constraints**: MUST follow Imtihan Constitution v1.1.0 (NextAuth v5 pattern)  
**Scale/Scope**: Core authentication foundation for the entire platform

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Framework**: Next.js App Router (JS)
- [x] **Auth**: NextAuth v5 pattern (Top-level `auth.js`)
- [x] **ORM**: Prisma for all data access
- [x] **Security**: bcrypt for password hashing
- [x] **Secrets**: Managed via `.env.local`

## Project Structure

### Documentation (this feature)

```text
specs/001-refactor-auth/
├── plan.md              # This file
├── research.md          # Technical decisions (bcrypt, NextAuth v5 patterns)
├── data-model.md        # User, Account, Session schemas
└── tasks.md             # Execution steps (to be generated)
```

### Source Code

```text
src/
├── app/
│   ├── api/
│   │   └── auth/           # NextAuth handlers
│   ├── auth/
│   │   └── signin/         # Custom sign-in page
│   └── dashboard/          # Protected dashboard routes
├── components/
│   └── Providers.js        # Auth session provider
├── lib/
│   ├── db.js               # Prisma client singleton
│   ├── casbin.js           # Casbin enforcer initialization
│   └── auth-guards.js      # withAuth higher-order function
├── auth.js                 # NextAuth core config
├── auth.config.js          # NextAuth middleware config
└── middleware.js           # Route protection middleware
```

**Structure Decision**: Standard Next.js App Router layout with a centralized `lib/` for shared utilities and top-level `auth.js` for authentication configuration as per NextAuth v5 standards.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
