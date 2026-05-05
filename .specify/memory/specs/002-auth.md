# PHASE 2 SPEC — Authentication & Role-Based Access
**Feature ID:** 002-auth  
**Phase:** 2 of 8  
**Depends on:** Phase 1 complete and tested  
**Estimated time:** Day 2–4  
**Test before proceeding:** All items in Acceptance Criteria must pass

---

## What this phase delivers
Complete authentication system: login page, register page, OTP email verification, JWT sessions with role stored, middleware route protection for all 10 roles, and role-specific dashboard shell pages (no content yet, just the layouts and "you are logged in as X" confirmation).

---

## Step-by-step Antigravity directives

### STEP 1 — Configure NextAuth

```
/implement
Create the NextAuth v5 configuration for Imtihan.

FILE: src/lib/auth.ts

Configure NextAuth with:
1. Providers: CredentialsProvider only (email + password)
   - Authorize function: find user by email in Prisma, verify password with bcryptjs
   - Return user object with: id, email, name, role
   - Throw error if user not found or password wrong

2. Adapter: PrismaAdapter(db) from @auth/prisma-adapter

3. Session strategy: "jwt"

4. Callbacks:
   jwt callback: add user.id and user.role to token
   session callback: add token.id and token.role to session.user

5. Pages:
   signIn: '/login'
   error: '/login'

6. Export: authOptions (for use in API routes and server components)
   Also export: { handlers, auth, signIn, signOut } = NextAuth(authOptions)

FILE: src/app/api/auth/[...nextauth]/route.ts
Import handlers from src/lib/auth.ts and export as GET and POST.

FILE: src/types/next-auth.d.ts
Extend NextAuth types to include role: Role on Session.user and JWT
Import Role enum from @prisma/client
```

---

### STEP 2 — Create middleware route protection

```
/implement
Create src/middleware.ts at the project root (NOT inside src/app/).

The middleware must:
1. Import: getToken from 'next-auth/jwt'
2. Run on all routes matching: /(student|teacher|admin)(.*)

Route protection rules:
- /student/* → allowed roles: student, guardian
- /teacher/* → allowed roles: teacher, institution_admin  
- /admin/* → allowed roles: super_admin, finance_manager, content_editor, moderator, marketer, support_agent

If no session: redirect to /login?callbackUrl={currentPath}
If wrong role: redirect to /unauthorized

Matcher config:
matcher: ['/(student|teacher|admin)/:path*']

IMPORTANT: Use App Router middleware pattern with NextResponse.redirect()
```

---

### STEP 3 — Create auth pages

```
/implement
Create all authentication pages with Imtihan branding.

FILE: src/app/(auth)/layout.tsx
- Centered layout, teal brand colour background on one side, form on other
- Show Imtihan logo (امتحان text + "imtihan" in Sora font)
- Responsive: stacked on mobile

FILE: src/app/(auth)/login/page.tsx
- Email + password form using React Hook Form + Zod
- Validation: email required + valid format, password min 8 chars
- Submit calls signIn('credentials', { email, password, redirectTo: callbackUrl })
- Show loading spinner during submission
- Show error message from NextAuth on failed login
- Link to /register and /forgot-password
- Use shadcn: Card, Form, Input, Button, Label

FILE: src/app/(auth)/register/page.tsx
- Fields: name (required), email (required), password (min 8), confirmPassword
- Role defaults to 'student' — students self-register
- On submit: POST to /api/auth/register
- After registration: show "Check your email for verification" message
- Link back to /login

FILE: src/app/api/auth/register/route.ts
- Accept: name, email, password
- Check if email already exists
- Hash password with bcryptjs (saltRounds: 12)
- Create User with role: 'student' via Prisma
- Create StudentProfile linked to new user
- Send welcome email via Resend
- Return: { message: 'Registration successful' }

FILE: src/app/(auth)/forgot-password/page.tsx
- Email input only
- POST to /api/auth/forgot-password
- Show "If that email exists, we sent a reset link" always (security)

FILE: src/app/unauthorized/page.tsx
- Clean page: "Access denied" 
- Show which role they are and what they tried to access
- Button to go back to their correct dashboard
- Use teal branding
```

---

### STEP 4 — Create role dashboard shells

```
/implement
Create dashboard shell pages for each role group. These are placeholder pages only — 
just layout + "authenticated as [role]" confirmation. Content comes in later phases.

FILE: src/app/(student)/layout.tsx
- Sidebar navigation with links: Dashboard, Past Papers, Practice MCQs, My Exams, AI Tutor, Settings
- Top bar: user avatar, name, notification bell
- Use teal-600 for active nav items, gold-400 for premium badge
- Sidebar collapses on mobile to bottom navigation bar
- Wrap children in TanStack Query provider and Zustand provider

FILE: src/app/(student)/dashboard/page.tsx
- Welcome message: "Assalam o Alaikum, [name]!"
- Show 4 stat cards: Today's MCQs, Study Streak, Past Papers Viewed, Overall Score
- All stats show 0 or skeleton — real data comes in Phase 5
- Use shadcn Card + shadcn Skeleton for loading state

FILE: src/app/(teacher)/layout.tsx
- Sidebar: Dashboard, My Classes, Create Test, MCQ Bank, Analytics, Settings
- Same top bar pattern as student layout

FILE: src/app/(teacher)/dashboard/page.tsx
- Placeholder: "Teacher Dashboard — content coming soon"
- Show role badge in teal

FILE: src/app/(admin)/layout.tsx
- Sidebar with sections based on role:
  - content_editor: Content, Past Papers, MCQ Bank
  - moderator: Review Queue, Reports
  - marketer: Campaigns, Promo Codes, Analytics
  - support_agent: Users, Tickets
  - super_admin: All sections
- Use slate-900 sidebar background (darker than student layout)

FILE: src/app/(admin)/dashboard/page.tsx
- Show logged-in user role prominently
- Placeholder content for now

FILE: src/app/page.tsx (landing/home)
- If user is logged in: redirect to correct dashboard based on role
  student/guardian → /student/dashboard
  teacher/institution_admin → /teacher/dashboard
  others → /admin/dashboard
- If not logged in: redirect to /login
```

---

### STEP 5 — Create shared components

```
/implement
Create shared components needed across the app.

FILE: src/components/shared/UserAvatar.tsx
- Props: user { name, avatar? }
- If avatar: show CldImage from next-cloudinary
- If no avatar: show initials in teal-100 background circle
- Sizes: sm (32px), md (40px), lg (64px)

FILE: src/components/shared/RoleBadge.tsx
- Props: role: Role
- Map each role to a colour and label:
  student → teal badge "Student"
  teacher → blue badge "Teacher"  
  super_admin → crimson badge "Super Admin"
  content_editor → purple badge "Content Editor"
  etc.
- Use shadcn Badge component

FILE: src/components/shared/LoadingSpinner.tsx
- Simple teal spinning circle
- Sizes: sm, md, lg
- Used throughout the app during loading states

FILE: src/components/shared/PageHeader.tsx
- Props: title, subtitle?, breadcrumbs?, action?
- Consistent page header used in all dashboard pages
- title in Sora font (font-heading class)

FILE: src/components/shared/EmptyState.tsx
- Props: title, description, action?
- Shown when lists are empty
- Simple illustration using SVG (books or pencil theme)
```

---

## Acceptance Criteria — test ALL of these before Phase 3

```
□ npm run dev starts without TypeScript errors
□ /register page loads and form submits successfully
□ New user appears in Prisma Studio → User table after registration
□ /login page loads with email + password form
□ Login with registered user succeeds and redirects to /student/dashboard
□ Student dashboard shows "Assalam o Alaikum, [name]!" with their name
□ Manually change a user's role to 'teacher' in Prisma Studio
□ Login as that teacher → redirects to /teacher/dashboard (not student)
□ Student trying to access /teacher/dashboard → redirects to /unauthorized
□ /unauthorized page shows correct message and back button
□ /login page shows error message for wrong password
□ Logout works and redirects to /login
□ Role badge shows correct colour for each role
□ Sidebar navigation renders on /student/dashboard
□ Mobile view (375px): sidebar collapses to bottom nav
□ Console shows no errors after all above tests
```
