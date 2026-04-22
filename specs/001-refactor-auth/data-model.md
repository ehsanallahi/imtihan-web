# Data Model: Authentication

## Entities

### User
Represents a person with access to the platform.
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `hashedPassword`: Securely hashed password (bcrypt)
- `role`: One of the 10 defined platform roles
- `isActive`: Boolean flag for account status

### Account
Linkage for OAuth providers (Reserved for future use).
- `userId`: Reference to User
- `provider`: Provider name (e.g., 'google')
- `providerAccountId`: Unique ID from the provider

### Session
Database-persisted session for stateful authentication.
- `sessionToken`: Unique token
- `userId`: Reference to User
- `expires`: Expiration timestamp

### VerificationToken
Tokens for email verification or password reset.
- `identifier`: User identifier (email)
- `token`: Unique verification token
- `expires`: Expiration timestamp

## Relationships
- A **User** can have multiple **Accounts** (1:N)
- A **User** can have multiple **Sessions** (1:N)
- **MCQs** and **Uploads** are linked to a **User** (the creator/uploader).
