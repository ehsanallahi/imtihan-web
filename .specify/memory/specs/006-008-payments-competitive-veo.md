# PHASE 6 SPEC — Subscriptions & JazzCash Payments
**Feature ID:** 006-payments  
**Phase:** 6 of 8  
**Depends on:** Phase 1–5 complete and tested  
**Estimated time:** Day 17–20

---

## What this phase delivers
Freemium paywall enforcement, subscription plans, JazzCash payment integration, and the premium upgrade flow.

---

## Step-by-step Antigravity directives

### STEP 1 — Subscription enforcement middleware

```
/implement
Create subscription checking utilities used throughout the app.

FILE: src/lib/subscription.ts
Functions:

getUserSubscription(userId: string):
- Query Prisma Subscription where userId AND status: 'active' AND endDate > now()
- Return the active subscription or null (null = free tier)

isPremium(userId: string): boolean
- Call getUserSubscription, return true if plan is not 'free' or null

getAiGenerationsToday(userId: string): number
- Count TextbookUploads for userId created today (after midnight PKT — UTC+5)
- Return count

FREE TIER LIMITS (enforce these everywhere):
const FREE_LIMITS = {
  aiGenerationsPerDay: 5,
  pastPapersPreview: 2,  // pages only
  practiceSessionsPerDay: 10,
}

FILE: src/components/shared/PremiumGate.tsx
'use client' component.
Props: feature: 'ai_generation' | 'full_pdf' | 'unlimited_practice', children
- Fetch subscription status using useQuery
- If premium: render children
- If free: render upgrade prompt UI (teal card with gold "Premium" badge)
  Show: what they're missing, price, "Upgrade Now" button → /pricing
```

---

### STEP 2 — Pricing page

```
/implement
Create the subscription pricing page.

FILE: src/app/(student)/pricing/page.tsx
Show 3 plan cards:

Plan 1: Free
- Price: PKR 0/month  
- Features: 10 practice sessions/day, 5 AI MCQ generations/day, past paper previews only
- CTA: "Current plan" (grayed out if already on free)

Plan 2: Student Premium — PKR 299/month
- Price: PKR 299/month or PKR 2,499/year (save 30%)
- Features: Unlimited practice, Unlimited AI MCQ generation, Full past papers, Weak topic analytics, AI Doubt Solver
- CTA: "Upgrade with JazzCash" (teal button)
- Badge: "Most Popular" in gold

Plan 3: Competitive Exam — PKR 1,499/month  
- Price: PKR 1,499/month
- Features: Everything in Student, MDCAT prep pack, ECAT prep pack, CSS study guides, Mock exams
- CTA: "Get Competitive"

Toggle: Monthly / Yearly (yearly shows discounted price)

Clicking "Upgrade" → POST to /api/payments/jazzcash/initiate
```

---

### STEP 3 — JazzCash integration

```
/implement
Create JazzCash payment integration.

NOTE TO AGENT: JazzCash uses HMAC-SHA256 signature for API calls.
Use the crypto module (built into Node.js) for signature generation.
Do NOT install any JazzCash-specific npm package.

FILE: src/lib/jazzcash.ts
Constants and utilities:

JAZZCASH_MERCHANT_ID from process.env.JAZZCASH_MERCHANT_ID
JAZZCASH_PASSWORD from process.env.JAZZCASH_PASSWORD  
JAZZCASH_INTEGRITY_SALT from process.env.JAZZCASH_INTEGRITY_SALT
JAZZCASH_API_URL = process.env.JAZZCASH_API_URL (sandbox or production)

Function: generateJazzCashSignature(params: object): string
- Sort params alphabetically by key
- Concatenate values with & separator: salt&value1&value2...
- Generate HMAC-SHA256 using JAZZCASH_INTEGRITY_SALT
- Return hex hash

Function: createPaymentRequest(amount: number, txnRefNo: string, description: string)
- Build payment request object with all required JazzCash fields
- Add signature
- Return request object

FILE: src/app/api/payments/jazzcash/initiate/route.ts
POST handler:
- Check session (must be logged in)
- Accept: { plan: SubscriptionPlan, billingPeriod: 'monthly' | 'yearly' }
- Calculate amount based on plan + period
- Generate unique txnRefNo: IMTIHAN-{userId}-{timestamp}
- Create pending Subscription in Prisma (status: 'pending', paymentRef: txnRefNo)
- Call createPaymentRequest from jazzcash.ts
- Return JazzCash payment form data to redirect user

FILE: src/app/api/payments/jazzcash/callback/route.ts
POST handler (JazzCash POSTs here after payment):
- Verify signature from JazzCash response
- Extract: pp_ResponseCode (000 = success), pp_TxnRefNo
- If success (code === '000'):
  Find Subscription by paymentRef = pp_TxnRefNo
  Update status to 'active', set startDate and endDate
  Send confirmation email via Resend
- If failure:
  Update status to 'cancelled'
- Redirect to /student/pricing?status=success or /student/pricing?status=failed

FILE: src/app/(student)/pricing/page.tsx (UPDATE)
Add success/failed state based on URL search params.
Show toast: "Payment successful! Welcome to Premium" or "Payment failed, please try again"

ADD to .env.example:
JAZZCASH_MERCHANT_ID="your_merchant_id"
JAZZCASH_PASSWORD="your_password"
JAZZCASH_INTEGRITY_SALT="your_salt"
JAZZCASH_API_URL="https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase"
```

---

## Acceptance Criteria — Phase 6

```
□ /student/pricing page shows all 3 plans correctly
□ Free user sees paywall when trying to generate 6th MCQ today
□ PremiumGate component shows upgrade prompt on locked features
□ JazzCash payment initiation creates pending Subscription in Prisma
□ (Sandbox test) JazzCash callback updates subscription to active
□ After activation: AI generation limit removed for premium user
□ After activation: full past papers accessible (no 2-page limit)
□ Subscription appears in Prisma Studio with correct dates
```

---

---

# PHASE 7 SPEC — Competitive Exam Packs (MDCAT, ECAT, CSS)
**Feature ID:** 007-competitive  
**Phase:** 7 of 8  
**Depends on:** Phase 1–6 complete and tested  
**Estimated time:** Day 21–24

---

## What this phase delivers
Dedicated preparation modules for MDCAT, ECAT, and CSS with subject-specific MCQ banks, mock exam timers, and performance tracking for competitive exams.

---

## Step-by-step Antigravity directives

### STEP 1 — Competitive exam data models

```
/implement
Add competitive exam models to Prisma schema and migrate.

Add to prisma/schema.prisma:

Model: CompetitiveExam
- id String @id @default(cuid())
- name String (MDCAT, ECAT, CSS, PPSC, FPSC, NTS, GAT, HAT)
- nameUrdu String?
- description String?
- totalMarks Int?
- durationMinutes Int?
- isActive Boolean @default(true)
- createdAt/updatedAt
- Relations: subjects (CompetitiveExamSubject[]), mockExams

Model: CompetitiveExamSubject  
(Links existing Subject to a competitive exam with paper-specific details)
- id String @id @default(cuid())
- examId String
- subjectId String
- questionCount Int (how many from this subject in real exam)
- marks Int

Run: npx prisma migrate dev --name add-competitive-exams
Run: npx prisma generate

Then seed competitive exam data:
Add to prisma/seed.ts:

MDCAT subjects: Biology (88 questions), Chemistry (58 questions), Physics (44 questions), English (20 questions), Logical Reasoning (10 questions)
ECAT subjects: Mathematics (30 questions), Physics (30 questions), Chemistry (30 questions), English (10 questions)
CSS subjects: English Essay, English Precis, General Knowledge, Current Affairs, Pakistan Affairs, Islamic Studies
```

---

### STEP 2 — Competitive exam interface

```
/implement
Create the competitive exam preparation interface.

FILE: src/app/(student)/competitive/page.tsx
Landing page showing available exams as cards:
- MDCAT card: total MCQs, mock test count, your score
- ECAT card: same
- CSS card: same
- Lock icon + "Competitive Plan required" on each card for non-subscribers

FILE: src/app/(student)/competitive/[examSlug]/page.tsx
Exam dashboard for e.g. /student/competitive/mdcat

Show:
- Exam overview: date (if known), total marks, duration
- Subject breakdown with progress bars (MCQs attempted vs total available)
- Start Mock Exam button: creates ExamSession with sessionType: 'mock_exam', timed
- Subject-wise practice: drill into one subject at a time
- Past performance: chart of mock exam scores over time

FILE: src/app/(student)/competitive/[examSlug]/mock/page.tsx
Full mock exam — same UI as regular exam (Phase 4) but:
- Timed exactly like the real exam (e.g., MDCAT = 150 minutes)
- Questions pulled from all subjects in correct proportions
- Cannot pause (real exam simulation)
- After submit: detailed performance breakdown by subject
- Compare with previous mock scores

FILE: src/app/(admin)/competitive/page.tsx
For content_editor/super_admin to manage competitive exam MCQs.
Upload MCQs in bulk via CSV (provide template download).
CSV format: question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, topic_tag, subject_name, exam_name
Parse CSV server-side and bulk insert via Prisma createMany.
```

---

## Acceptance Criteria — Phase 7

```
□ /student/competitive shows MDCAT, ECAT, CSS cards
□ Non-competitive subscriber sees lock icon
□ Competitive subscriber can enter MDCAT dashboard
□ Start MDCAT mock exam → timer shows 150:00 countdown
□ Mock exam pulls correct subject proportions (88 Bio, 58 Chem, etc.)
□ Complete mock exam → score breakdown by subject shows
□ Content editor can upload MCQs via CSV bulk import
□ Imported MCQs appear in Prisma Studio with correct exam/subject links
```

---

---

# PHASE 8 SPEC — Veo 3 AI Video Explanations
**Feature ID:** 008-veo-videos  
**Phase:** 8 of 8  
**Depends on:** Phase 1–7 complete and tested  
**Estimated time:** Day 25–30

---

## What this phase delivers
The biggest differentiator: when students fail a concept-based MCQ, Gemini generates a visual prompt, which Veo 3 turns into an 8-second animated explanation video. Videos are cached in Cloudinary so each concept is only generated once.

---

## Step-by-step Antigravity directives

### STEP 1 — Veo 3 video generation pipeline

```
/implement
Create the Veo 3 video generation pipeline.

IMPORTANT FOR AGENT: Veo 3 is accessed via the Google AI API (same key as Gemini).
The model name is: 'veo-3.0-generate-preview'
Video generation is async — it returns an operation name, then you poll until done.
Use the @google/generative-ai package.

FILE: src/lib/veo.ts
Import GoogleGenerativeAI from '@google/generative-ai'
Initialize with GOOGLE_AI_API_KEY

Function: generateConceptVideo(concept: string, subject: string): Promise<string>
  Returns: Cloudinary URL of the generated video

Step 1 — Check cache first:
  Query Prisma ConceptVideo where topicTag = concept (add this model below)
  If found and cloudinaryUrl exists: return cloudinaryUrl immediately (cached)

Step 2 — Generate Gemini prompt for Veo:
  Use proModel to generate a video prompt:
  Ask Gemini: "Create a concise 8-second educational animation prompt for Veo 3 
  that visually explains: [concept] for a Pakistani high school student.
  Be specific about visuals, motion, text labels, and educational clarity.
  Keep it under 100 words."

Step 3 — Call Veo 3 API:
  POST to: https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-preview:generateVideo
  Headers: x-goog-api-key: GOOGLE_AI_API_KEY, Content-Type: application/json
  Body: { "prompt": geminiPrompt, "generationConfig": { "durationSeconds": 8, "aspectRatio": "9:16" } }
  Response: { "name": "operations/..." } (async operation)

Step 4 — Poll for completion:
  GET https://generativelanguage.googleapis.com/v1beta/{operation.name}
  Poll every 5 seconds, max 10 attempts (50 seconds timeout)
  When done: extract video URL from response

Step 5 — Upload video to Cloudinary:
  cloudinary.uploader.upload(videoUrl, { resource_type: 'video', folder: 'imtihan/concept-videos', public_id: sanitize(concept) })
  Returns: secure_url

Step 6 — Save to Prisma ConceptVideo:
  Create record with topicTag, cloudinaryUrl, cloudinaryId, subject

Step 7 — Return cloudinaryUrl

Add ConceptVideo model to prisma/schema.prisma:
- id String @id @default(cuid())
- topicTag String @unique
- subject String
- cloudinaryUrl String
- cloudinaryId String
- createdAt DateTime @default(now())
Run: npx prisma migrate dev --name add-concept-videos

FILE: src/app/api/ai/video/route.ts
POST handler.
- Check session: premium users only (free users see "Upgrade" message)
- Accept: { topicTag: string, subjectId: string }
- Call generateConceptVideo (imported from src/lib/veo.ts)
- This may take 30-60 seconds — use streaming response or polling pattern
- Return: { videoUrl: string } or { status: 'generating', operationId: string }

Use background processing:
  Return immediately with { status: 'queued', jobId: uuid }
  Start generation in background (don't await)
  Client polls GET /api/ai/video/status/[jobId] every 3 seconds
  Store job status in a simple in-memory Map (or Prisma JobStatus model)
```

---

### STEP 2 — Video trigger in exam results

```
/implement
Show video explanation button on exam results for wrong answers.

FILE: src/app/(student)/practice/[sessionId]/results/page.tsx (UPDATE)
For each incorrectly answered MCQ that has a topicTag:
- Add "Watch explanation" button below the wrong answer
- Button triggers video generation/fetch for that topicTag
- Show loading state while video generates (first time takes ~60 seconds)
- Show video player (HTML5 video element) once URL is available
- Subsequent views: instant (cached in Cloudinary)

FILE: src/components/student/ConceptVideoPlayer.tsx
'use client' component.
Props: topicTag: string, subject: string

State: { status: 'idle' | 'loading' | 'ready' | 'error', videoUrl?: string }

UI:
- Idle: "Watch AI explanation" button with play icon (teal)
- Loading: spinner + "Generating your explanation video... (this may take up to 60 seconds)"
  Show cycling messages: "Understanding the concept...", "Creating animation...", "Almost ready..."
- Ready: HTML5 <video> element with controls, autoplay, loop
  Style: rounded corners, max-height 400px, centered
- Error: "Video generation failed" with retry button

Polling logic:
- On button click: POST to /api/ai/video → get jobId
- Poll /api/ai/video/status/[jobId] every 3 seconds
- Update state when video ready
```

---

### STEP 3 — Marketing video generation (admin)

```
/implement
Allow the marketer role to generate short promotional videos using Veo 3.

FILE: src/app/(admin)/marketing/videos/page.tsx
Only visible to: marketer, super_admin

Form:
- Video type: Select (Feature explanation, Subject promo, Exam countdown)
- Description: Textarea (describe what the video should show)
- Generate button

On generate: POST to /api/ai/video/marketing
Show loading + polling same as student flow
Show generated video with download button
Also show: Share to WhatsApp button (opens wa.me share URL)
Store all generated marketing videos in Prisma with metadata
```

---

## Acceptance Criteria — Phase 8

```
□ Complete a practice session and get at least one MCQ wrong
□ "Watch explanation" button appears on wrong answer
□ Click button → loading state appears with cycling messages  
□ Video generates within 60 seconds (first time)
□ Video plays in the player without errors
□ Click same button again → video appears instantly (cached)
□ Check Cloudinary dashboard → video in imtihan/concept-videos/ folder
□ Check Prisma Studio → ConceptVideo record with cloudinaryUrl
□ Free student sees "Upgrade to watch explanations" instead of button
□ Premium student can watch explanations
□ As marketer: generate 1 promotional video → downloads successfully
□ npx tsc --noEmit → zero errors across entire codebase
```

---

---

# MASTER CHECKLIST — All phases summary

```
PHASE 1 — Foundation         □ DB schema  □ Config files  □ Tailwind  □ shadcn
PHASE 2 — Auth               □ Login/Register  □ Roles  □ Route protection  □ Dashboards
PHASE 3 — Past Papers        □ Cloudinary upload  □ Browse/view  □ SEO pages  □ Paywall
PHASE 4 — MCQ + Exams        □ MCQ bank  □ Exam flow  □ Results  □ Performance data
PHASE 5 — AI MCQ + Tutor     □ PDF→MCQ pipeline  □ Doubt solver  □ Weak topics
PHASE 6 — Payments           □ Pricing page  □ JazzCash  □ Subscription enforcement
PHASE 7 — Competitive        □ MDCAT/ECAT/CSS  □ Mock exams  □ Bulk MCQ import
PHASE 8 — Veo Videos         □ Video pipeline  □ Results integration  □ Caching
```
