# Tasks: Refactor Authentication Module

**Input**: Design documents from `/specs/001-refactor-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create project structure per implementation plan
- [x] T002 Configure .env with AUTH_SECRET and database credentials

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T003 [P] Implement Prisma Client singleton in src/lib/db.js
- [x] T004 [P] Define User, Account, Session models in prisma/schema.prisma
- [x] T005 Run Prisma migrations to apply schema changes

## Phase 3: User Story 1 - Credential Sign-in (Priority: P1) 🎯 MVP

**Goal**: Authenticate users against real database records using email and hashed password.

**Independent Test**: Sign in with a known user from the database; verify failure with wrong password or non-existent email.

- [x] T006 [US1] Create NextAuth configuration in src/auth.js
- [x] T007 [US1] Implement credential provider with real DB lookup and bcrypt
- [x] T008 [US1] Create custom sign-in page in src/app/auth/signin/page.js

## Phase 4: User Story 2 - Role-Aware Session (Priority: P2)

**Goal**: Embed user role in the session token and provide guards for API protection.

**Independent Test**: Access a protected API route as a student vs admin; verify 403 vs 200.

- [x] T009 [US2] Update JWT and Session callbacks in src/auth.js to include user role
- [x] T010 [US2] Implement authorization guard higher-order function in src/lib/auth-guards.js
- [x] T011 [US2] Implement Casbin enforcer initialization in src/lib/casbin.js

## Phase 5: User Story 3 - Secure Session Config (Priority: P3)

**Goal**: Configure middleware and secure environment settings.

**Independent Test**: Attempt to access /dashboard without signing in; verify redirect to /auth/signin.

- [x] T012 [US3] Configure NextAuth middleware in src/middleware.js for route protection
- [x] T013 [US3] Configure auth.config.js with callback logic for dashboard protection

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 Add logout button to dashboard header in src/app/dashboard/layout.js
- [x] T015 Verify sign-in/out flow manually across all roles
- [x] T016 [P] Add test API route for Casbin verification in src/app/api/test-casbin/route.js

## Dependencies & Execution Order

1. **Setup & Foundational** (T001-T005) are complete.
2. **User Story 1** (T006-T008) is complete.
3. **User Story 2** (T009-T011) is complete.
4. **User Story 3** (T012-T013) is complete.
5. **Phase 6** (T014-T016) is complete.
6. **Next Steps**: Feature implementation is complete. Proceed to final walkthrough.
