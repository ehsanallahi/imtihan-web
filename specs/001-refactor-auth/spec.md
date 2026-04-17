# Feature Specification: Refactor Authentication Module

**Feature Branch**: `001-refactor-auth`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Refactor the authentication module"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Credential Sign-in with Real Database Lookup (Priority: P1)

A registered user visits the sign-in page, enters their email and password, and the system validates their credentials against the actual user records in the database. On success the user is issued a secure session token. On failure a clear error message is shown.

**Why this priority**: The current implementation returns a hardcoded demo user for any email/password pair — this is a critical security hole that must be fixed first. Without real credential validation, the entire platform is effectively unauthenticated.

**Independent Test**: Can be fully tested by registering a user in the database, attempting sign-in with correct and incorrect credentials, and verifying the session is created only on correct credentials.

**Acceptance Scenarios**:

1. **Given** a user exists with email `student@imtihan.pk` and a hashed password, **When** they submit valid credentials, **Then** they receive a valid session and are redirected to their dashboard.
2. **Given** a user exists in the database, **When** they submit an incorrect password, **Then** the system returns an authentication failure message and no session is created.
3. **Given** no user exists with the submitted email, **When** they attempt to sign in, **Then** the system returns a generic "invalid credentials" message (no enumeration attack).

---

### User Story 2 — Role-Aware Session (Priority: P2)

After signing in, the user's role (e.g., `student`, `teacher`, `super_admin`) is embedded in their session token. Every protected API route reads the role from the session and checks permissions before processing the request.

**Why this priority**: The platform's Casbin RBAC/ABAC model requires the role to be available in the session so downstream permission checks can function correctly. Without this, Casbin enforcement cannot be applied.

**Independent Test**: Can be tested by signing in as users of different roles and verifying that the session object contains the correct `role` field and that API routes enforce role restrictions.

**Acceptance Scenarios**:

1. **Given** a signed-in `student`, **When** they call an API route restricted to `teacher` or above, **Then** the route returns a `403 Forbidden` response.
2. **Given** a signed-in `super_admin`, **When** they access any protected route, **Then** the request is processed normally.
3. **Given** an unauthenticated request, **When** it hits any protected API route, **Then** the route returns a `401 Unauthorized` response.

---

### User Story 3 — Secure Session Configuration (Priority: P3)

The authentication system uses a properly generated secret, enforces session expiry, and is configured to work correctly in both development and production environments without exposing credentials.

**Why this priority**: The current `NEXTAUTH_SECRET` is set to a literal placeholder string — any deployment would be insecure. This must be resolved before any further development.

**Independent Test**: Can be verified by checking environment configuration documentation and confirming session tokens cannot be decoded without the correct secret.

**Acceptance Scenarios**:

1. **Given** the application starts with a properly set `NEXTAUTH_SECRET`, **When** a session token is issued, **Then** it can only be verified by the application holding the correct secret.
2. **Given** a session token older than the configured expiry, **When** the user makes a request, **Then** they are redirected to the sign-in page.

---

### Edge Cases

- What happens when the database is unreachable during a sign-in attempt?
- How does the system handle concurrent sign-in attempts with the same credentials?
- What if a user's role changes while they have an active session — is the old role still in effect until the session expires?
- How is a compromised session invalidated before natural expiry?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST validate credentials against real user records in the database — no hardcoded or demo user bypasses are permitted.
- **FR-002**: The system MUST store passwords as secure one-way hashes — plaintext passwords must never be written to or read from the database.
- **FR-003**: The session token MUST include the authenticated user's role so that access-control checks can be performed without an additional database query per request.
- **FR-004**: Every protected API route MUST verify the session and check role-based permissions before processing the request, using the project's established permission system.
- **FR-005**: The authentication secret MUST be loaded from an environment variable and must never be committed to source control.
- **FR-006**: The system MUST expose a server-side authentication helper that Server Components and API route handlers can call to retrieve the current session without additional boilerplate.
- **FR-007**: The system MUST define the required data schema for user accounts, sessions, and verification tokens so the ORM can persist them correctly.
- **FR-008**: Unauthenticated requests to protected routes MUST receive a `401 Unauthorized` response rather than silently proceeding.
- **FR-009**: Requests from authenticated users lacking the required permission MUST receive a `403 Forbidden` response.

### Key Entities

- **User**: Represents a platform account. Key attributes: unique identifier, email address, hashed password, role, account status, timestamps.
- **Session**: Represents an active authenticated session. Key attributes: session token, linked user, expiry time.
- **Account**: Represents an OAuth provider linkage (for future OAuth support). Key attributes: provider, provider account ID, linked user.
- **VerificationToken**: Short-lived token used for email-based actions such as email verification or password reset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero users can access the system using credentials that do not exist in the database — the authentication bypass is completely eliminated.
- **SC-002**: 100% of protected API routes enforce role-permission checks before returning data — routes with missing checks are identified during code review.
- **SC-003**: Session tokens are issued and validated using a secret that is different per environment (development vs. production) and is never stored in version control.
- **SC-004**: A developer can determine the current user's identity and role in a Server Component or API handler by calling a single function — no raw session parsing is needed.
- **SC-005**: The user and session data schema is fully defined and can be applied to the database without manual SQL — migrations are generated and tracked automatically.

## Assumptions

- An email-and-password credential flow is the initial authentication method; OAuth providers (Google, GitHub) are explicitly out of scope for this refactor.
- The database already has the Supabase PostgreSQL connection configured — the schema changes only need to be applied, not the connection itself.
- Casbin policies will be seeded separately; this refactor only ensures the role is available in the session and that the enforcement hook is in place on API routes.
- The existing `Providers.js` client-side session wrapper is already correct and does not need to change.
- Mobile support and push-notification sign-in are out of scope for this refactor.
- Password reset / forgot-password flow is out of scope for this refactor (tracked separately).
