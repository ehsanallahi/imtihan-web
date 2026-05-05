# Research: Authentication Refactor

## Decision: NextAuth v5 (Auth.js) Pattern
**Rationale**: The Imtihan Constitution v1.1.0 explicitly requires the NextAuth v5 API pattern. This ensures compatibility with the Next.js App Router and provides a cleaner separation of middleware-compatible config (`auth.config.js`) and full configuration (`auth.js`).

**Alternatives considered**: 
- NextAuth v4: Rejected because it's legacy and doesn't support the same App Router patterns natively.
- Custom JWT implementation: Rejected because NextAuth provides a robust, audited foundation for session management and adapter support.

## Decision: bcryptjs for Password Hashing
**Rationale**: Required by Principle II of the Constitution. `bcryptjs` is a pure JavaScript implementation that avoids native binding issues common with the standard `bcrypt` package, making it more portable across environments.

**Alternatives considered**:
- Argon2: Excellent security but requires native bindings which can be finicky in some serverless environments. Constitution allows either, but `bcryptjs` is chosen for ease of deployment.

## Decision: Casbin for RBAC
**Rationale**: Required by the Constitution for all role-based access control. Using `casbin-prisma-adapter` allows storing policies in the same database as user data, ensuring consistency.

**Alternatives considered**:
- Ad-hoc role checks: Rejected because they are error-prone and hard to audit. Casbin provides a centralized, formal model for permissions.
