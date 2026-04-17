# PHASE 1 SPEC — Foundation Setup
**Feature ID:** 001-foundation  
**Phase:** 1 of 8  
**Estimated time:** Day 1–2  
**Test before proceeding:** All items in Acceptance Criteria must pass

---

## What this phase delivers
A working Next.js project with all dependencies installed, database connected, folder structure created, Tailwind + shadcn configured with Imtihan brand colours, and a complete Prisma schema with all models. No visible UI yet — just the engine.

---

## Step-by-step Antigravity directives

### STEP 1 — Install all dependencies

Run this directive in Antigravity:

```
/plan
Install all project dependencies for Imtihan exam prep platform.

Run these exact commands in order:

1. Install core dependencies:
npm install @prisma/client next-auth@beta @auth/prisma-adapter
npm install @google/generative-ai
npm install cloudinary next-cloudinary
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install casbin casbin-prisma-adapter
npm install resend
npm install pdf-parse
npm install @types/pdf-parse --save-dev
npm install date-fns
npm install lucide-react

2. Install shadcn/ui (interactive — choose these options):
npx shadcn@latest init
→ TypeScript: Yes
→ Style: Default  
→ Base color: Slate
→ CSS variables: Yes
→ Tailwind config: Yes
→ Components alias: @/components
→ Utils alias: @/lib/utils

3. Install shadcn components we need:
npx shadcn@latest add button card input label form
npx shadcn@latest add dialog sheet dropdown-menu
npx shadcn@latest add table badge avatar progress
npx shadcn@latest add tabs toast skeleton
npx shadcn@latest add select textarea checkbox

4. Initialize Prisma:
npx prisma init

After all installs complete, verify package.json has all packages listed above.
```

---

### STEP 2 — Configure Tailwind with Imtihan brand colours

```
/implement
Update tailwind.config.ts to add Imtihan brand colours and fonts.

The file should extend the theme with:

colors:
  teal: { 50: '#e3f6f0', 100: '#b8e9d8', 200: '#5dcaa5', 400: '#1aab7a', 600: '#0e7a57', 900: '#063d2b' }
  gold: { 50: '#fdf4e3', 100: '#fae3b0', 200: '#f5c342', 400: '#e6a817', 600: '#b07d08', 900: '#5a3f02' }
  crimson: { 50: '#fceef0', 100: '#f5c8cd', 400: '#d63a4a', 600: '#a02030', 900: '#4f0f17' }
  (keep all existing slate, gray, etc.)

fontFamily:
  sans: ['Inter', 'sans-serif']
  heading: ['Sora', 'sans-serif']
  urdu: ['Noto Nastaliq Urdu', 'serif']
  mono: ['JetBrains Mono', 'monospace']

Also update src/app/globals.css to:
1. Add Google Fonts import at top for: Inter (400,500,600), Sora (500,600,700), Noto Nastaliq Urdu (400,700), JetBrains Mono (400,500)
2. Keep existing Tailwind directives (@tailwind base/components/utilities)
3. Add CSS variables for brand colours matching the tailwind config
4. Add .font-urdu utility class that sets font-family to Noto Nastaliq Urdu and direction to rtl
```

---

### STEP 3 — Create all library config files

```
/implement
Create these 4 configuration files exactly as described:

FILE 1: src/lib/db.ts
- Prisma client singleton pattern (prevents connection pool exhaustion in Next.js dev)
- Export as: export const db = globalThis.prisma ?? new PrismaClient()
- In development: set globalThis.prisma = db
- Add: import { PrismaClient } from '@prisma/client'

FILE 2: src/lib/cloudinary.ts  
- Import: import { v2 as cloudinary } from 'cloudinary'
- Configure with: cloud_name, api_key, api_secret from process.env
- Set secure: true always
- Export cloudinary as default

FILE 3: src/lib/gemini.ts
- Import: import { GoogleGenerativeAI } from '@google/generative-ai'
- Create flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
- Create proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
- Export both: export { flashModel, proModel }
- Use process.env.GOOGLE_AI_API_KEY

FILE 4: src/lib/casbin.ts
- Import: import { newEnforcer } from 'casbin'
- Create enforcer from model string and policy file
- RBAC model definition:
  [request_definition]: r = sub, obj, act
  [policy_definition]: p = sub, obj, act
  [role_definition]: g = _, _
  [policy_effect]: e = some(where (p.eft == allow))
  [matchers]: m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
- Export: checkPermission(role, resource, action) async function that returns boolean
- Save policy file at: src/lib/casbin-policy.csv

FILE 5: src/lib/casbin-policy.csv
Define all permissions:
p, student, mcq, read
p, student, past_paper, read
p, student, exam_session, write
p, student, textbook_upload, write
p, guardian, student_progress, read
p, guardian, subscription, write
p, teacher, mcq, write
p, teacher, mcq, read
p, teacher, class_analytics, read
p, teacher, exam_session, write
p, institution_admin, teacher, write
p, institution_admin, student, read
p, institution_admin, institution_analytics, read
p, content_editor, past_paper, write
p, content_editor, mcq, write
p, moderator, user_content, write
p, marketer, promo_code, write
p, marketer, growth_metrics, read
p, support_agent, user_account, read
p, support_agent, subscription, write
p, finance_manager, financial_report, read
p, super_admin, *, *
```

---

### STEP 4 — Create complete Prisma schema

```
/implement
Create the complete prisma/schema.prisma file for Imtihan.

Datasource: postgresql, use DATABASE_URL for url, DIRECT_URL for directUrl
Generator: prisma-client-js

MODELS TO CREATE:

Model: User
- id String @id @default(cuid())
- email String @unique
- name String?
- nameUrdu String?
- phone String? @unique
- role Role @default(student)
- avatar String? (Cloudinary URL)
- avatarId String? (Cloudinary public_id)
- isActive Boolean @default(true)
- emailVerified DateTime?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
- deletedAt DateTime?
- Relations: accounts, sessions, studentProfile, teacherProfile, guardianProfile, subscriptions, examSessions, uploadedContent

Enum: Role
VALUES: super_admin, finance_manager, content_editor, moderator, marketer, support_agent, institution_admin, teacher, guardian, student

Model: Account (for NextAuth OAuth — required)
- Standard NextAuth account model fields
- Relation: user User

Model: Session (for NextAuth — required)
- Standard NextAuth session model fields
- Relation: user User

Model: VerificationToken (for NextAuth — required)
- Standard NextAuth verification token fields

Model: StudentProfile
- id String @id @default(cuid())
- userId String @unique
- grade Grade? (enum: nine, ten, eleven, twelve)
- board Board? (enum: punjab, sindh, kpk, federal, aku, private)
- studyStreak Int @default(0)
- totalMcqsAttempted Int @default(0)
- createdAt/updatedAt
- Relations: user, guardians (GuardianStudent[])

Enum: Grade
VALUES: nine, ten, eleven, twelve

Enum: Board
VALUES: punjab, sindh, kpk, federal, aku, private

Model: TeacherProfile
- id String @id @default(cuid())
- userId String @unique
- institutionId String?
- subjectSpecialty String?
- createdAt/updatedAt
- Relations: user, institution, classes

Model: Institution
- id String @id @default(cuid())
- name String
- city String?
- adminId String (userId of institution_admin role)
- createdAt/updatedAt
- Relations: teachers, students

Model: GuardianStudent (junction table)
- id String @id @default(cuid())
- guardianId String
- studentProfileId String
- createdAt DateTime @default(now())

Model: Subject
- id String @id @default(cuid())
- name String
- nameUrdu String?
- grade Grade
- board Board
- isActive Boolean @default(true)
- createdAt/updatedAt
- Relations: chapters, pastPapers, mcqBanks

Model: Chapter
- id String @id @default(cuid())
- name String
- nameUrdu String?
- number Int
- subjectId String
- createdAt/updatedAt
- Relations: subject, mcqs, textbookUploads

Model: PastPaper
- id String @id @default(cuid())
- title String
- year Int
- board Board
- grade Grade
- subjectId String
- cloudinaryUrl String (secure_url from Cloudinary)
- cloudinaryId String (public_id from Cloudinary)
- isPremium Boolean @default(false)
- totalMarks Int?
- uploadedById String (content_editor userId)
- createdAt/updatedAt
- deletedAt DateTime?
- Relations: subject, uploadedBy

Model: MCQ
- id String @id @default(cuid())
- question String
- questionUrdu String?
- optionA String
- optionB String
- optionC String
- optionD String
- correctAnswer String (must be 'A', 'B', 'C', or 'D')
- explanation String?
- difficulty Difficulty @default(medium)
- topicTag String?
- chapterId String?
- subjectId String
- isAiGenerated Boolean @default(false)
- isApproved Boolean @default(true)
- createdById String
- createdAt/updatedAt
- deletedAt DateTime?

Enum: Difficulty
VALUES: easy, medium, hard

Model: TextbookUpload
- id String @id @default(cuid())
- cloudinaryUrl String
- cloudinaryId String
- originalName String
- uploadedById String (student userId)
- chapterId String?
- subjectId String?
- mcqsGenerated Boolean @default(false)
- createdAt DateTime @default(now())
- Relations: uploadedBy, mcqs (MCQ[])

Model: ExamSession
- id String @id @default(cuid())
- studentId String
- sessionType SessionType (enum: practice, mock_exam, past_paper)
- subjectId String?
- pastPaperId String?
- totalQuestions Int
- correctAnswers Int @default(0)
- timeTakenSeconds Int?
- completedAt DateTime?
- createdAt DateTime @default(now())
- Relations: student, results

Enum: SessionType
VALUES: practice, mock_exam, past_paper

Model: MCQAttempt
- id String @id @default(cuid())
- examSessionId String
- mcqId String
- selectedAnswer String
- isCorrect Boolean
- timeTakenSeconds Int?
- createdAt DateTime @default(now())
- Relations: examSession, mcq

Model: Subscription
- id String @id @default(cuid())
- userId String
- plan SubscriptionPlan (enum: free, student_monthly, student_yearly, competitive_monthly, institution_yearly)
- status SubscriptionStatus (enum: active, expired, cancelled, pending)
- startDate DateTime
- endDate DateTime?
- amountPkr Int (stored in paisa, e.g., 29900 = PKR 299)
- paymentMethod String? (jazzcash, easypaisa, card)
- paymentRef String?
- createdAt/updatedAt

Enum: SubscriptionPlan
VALUES: free, student_monthly, student_yearly, competitive_monthly, institution_yearly

Enum: SubscriptionStatus  
VALUES: active, expired, cancelled, pending

Model: PromoCode
- id String @id @default(cuid())
- code String @unique
- discountPercent Int
- maxUses Int?
- usedCount Int @default(0)
- expiresAt DateTime?
- createdById String
- isActive Boolean @default(true)
- createdAt/updatedAt

After writing schema, run: npx prisma migrate dev --name init
Then run: npx prisma generate
```

---

### STEP 5 — Create environment example file

```
/implement
Create .env.example file (safe to commit — no real values):

# Database (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Auth
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google AI (Gemini API)
GOOGLE_AI_API_KEY="AIza..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# Email
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

Also create .gitignore and ensure these are listed:
.env.local
.env
node_modules/
.next/
```

---

## Acceptance Criteria — test ALL of these before Phase 2

```
□ npm run dev starts without errors
□ No TypeScript errors (run: npx tsc --noEmit)
□ Prisma schema migrated: npx prisma studio opens and shows all tables
□ All 14+ models visible in Prisma Studio
□ src/lib/db.ts, cloudinary.ts, gemini.ts, casbin.ts all exist
□ tailwind.config.ts has teal, gold, crimson colour scales
□ globals.css imports Google Fonts (Sora, Inter, Noto Nastaliq Urdu, JetBrains Mono)
□ shadcn components exist in src/components/ui/
□ .env.example exists and is committed, .env.local is gitignored
□ No console errors on http://localhost:3000
```

---

## What Phase 2 depends on from this phase
- Working Prisma client and all database models
- All lib config files (auth, cloudinary, gemini, casbin)
- Tailwind brand colours configured
- shadcn/ui components installed
