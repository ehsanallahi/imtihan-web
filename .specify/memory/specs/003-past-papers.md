# PHASE 3 SPEC — Cloudinary Uploads & Past Paper Bank
**Feature ID:** 003-past-papers  
**Phase:** 3 of 8  
**Depends on:** Phase 1 + Phase 2 complete and tested  
**Estimated time:** Day 5–8  
**Test before proceeding:** All items in Acceptance Criteria must pass

---

## What this phase delivers
Complete past paper system: content editors can upload PDFs via Cloudinary, students can browse and view past papers organised by board/grade/subject/year. SEO-optimised static pages for Google indexing. Premium paywall for full PDF access.

---

## Step-by-step Antigravity directives

### STEP 1 — Cloudinary upload infrastructure

```
/implement
Create the Cloudinary upload infrastructure.

FILE: src/app/api/cloudinary/sign/route.ts
- POST handler
- Check session with getServerSession(authOptions) — return 401 if no session
- Check role: only content_editor and super_admin can upload past papers
  Use Casbin: checkPermission(role, 'past_paper', 'write')
  Return 403 if not permitted
- Accept body: { paramsToSign: object }
- Generate signature: cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!)
- Return: { signature, timestamp }

FILE: src/actions/uploadPastPaper.ts ('use server')
- Import: cloudinary from '@/lib/cloudinary', db from '@/lib/db'
- Accept FormData with fields: file (File), board, grade, subjectId, year, title, isPremium
- Server-side validation:
  - File type must be 'application/pdf' — reject others
  - File size must be under 10MB — reject larger
  - year must be between 2000 and current year
- Convert file to base64 dataUri
- Upload to Cloudinary:
  resource_type: 'raw'
  folder: `imtihan/past-papers/${board}/${grade}`
  use_filename: true
  unique_filename: true
- Save to Prisma PastPaper model with all fields including cloudinaryUrl and cloudinaryId
- Return: { success: true, paperId: string } or { success: false, error: string }
- Wrap entirely in try/catch

FILE: src/actions/deletePastPaper.ts ('use server')  
- Accept: paperId string
- Check permission: only content_editor and super_admin
- Get paper from Prisma, get cloudinaryId
- Delete from Cloudinary: cloudinary.uploader.destroy(cloudinaryId, { resource_type: 'raw' })
- Soft delete in Prisma: update deletedAt to now()
- Return: { success: boolean }
```

---

### STEP 2 — Past paper browsing (student-facing)

```
/implement
Create the student-facing past paper browsing experience.

FILE: src/app/(student)/past-papers/page.tsx
Server component.
- Fetch all boards, grades, subjects from Prisma
- Show filter UI: Board selector, Grade selector, Subject selector
- Each filter is a URL search param (?board=punjab&grade=nine&subject=biology)
- Filtered results show as a grid of PastPaperCard components
- Show count: "X past papers found"
- If no filters selected: show popular/recent papers

FILE: src/app/(student)/past-papers/[board]/[grade]/[subject]/[year]/page.tsx
Server component with generateStaticParams.
- generateStaticParams: query ALL past papers from Prisma and return all board/grade/subject/year combinations
- This creates static pages for every past paper for SEO
- Page shows: paper title, year, board, grade, subject, total marks
- Free preview: embed PDF viewer showing first 2 pages only for free users
  Use <iframe> with Cloudinary URL + page range
- Premium CTA: "View full paper — upgrade to Premium" button for free users
- Full PDF: show complete CloudinaryUrl in iframe for premium users
- Check subscription: getServerSession → check user's active subscription
- generateMetadata: return title like "Punjab Board Biology Class 9 Past Paper 2023 | Imtihan"
  This is critical for SEO

FILE: src/components/student/PastPaperCard.tsx
- Props: paper (PastPaper with subject relation)
- Show: subject name, year, board badge, grade badge, premium lock icon if isPremium
- Teal border-left accent
- Link to the paper's static page
- Download count (just display 0 for now)

FILE: src/app/past-papers/[board]/[grade]/[subject]/[year]/page.tsx
PUBLIC page (no auth required) — for SEO crawling.
Same as student version but without premium bypass.
Shows paper title, year, metadata.
CTA button: "View this paper — sign up free"
This page gets indexed by Google.

FILE: src/app/sitemap.ts
Generate sitemap for all past paper public pages.
Fetch all non-deleted past papers from Prisma.
Return array of: { url, lastModified, changeFrequency: 'yearly', priority: 0.8 }
```

---

### STEP 3 — Admin upload interface

```
/implement
Create the content editor interface for uploading past papers.

FILE: src/app/(admin)/past-papers/page.tsx
- List all past papers in a shadcn Table
- Columns: Title, Board, Grade, Subject, Year, Premium, Uploaded By, Date, Actions
- Actions: View PDF, Delete (with confirmation dialog)
- Search bar to filter by title
- Upload button opens upload dialog

FILE: src/app/(admin)/past-papers/upload/page.tsx
Upload form for content editors.
Fields:
- Board: Select (punjab, sindh, kpk, federal, aku, private)
- Grade: Select (9, 10, 11, 12)
- Subject: Select (fetched from Prisma based on selected board+grade)
- Year: Number input (2000 to current year)
- Title: Text input (auto-fills as "Punjab Board Biology Class 9 2023" when fields selected)
- Is Premium: Checkbox
- PDF File: Upload button using CldUploadWidget with signed upload

CldUploadWidget config:
- signatureEndpoint: '/api/cloudinary/sign'
- uploadPreset: 'imtihan_past_papers' (you created this in Cloudinary dashboard)
- options: { maxFiles: 1, clientAllowedFormats: ['pdf'], maxFileSize: 10_000_000, sources: ['local'] }
- onSuccess callback: capture secure_url and public_id

On form submit: call uploadPastPaper server action
Show success toast: "Past paper uploaded successfully"
Show error toast with message on failure
After success: redirect to /admin/past-papers

FILE: src/components/admin/PastPaperTable.tsx
Reusable table component.
Use shadcn Table, Badge, Button components.
Delete action: show shadcn AlertDialog for confirmation before calling deletePastPaper action.
```

---

### STEP 4 — Subject seeding

```
/implement
Create a database seed file to populate subjects for all boards and grades.

FILE: prisma/seed.ts

Seed these subjects for Punjab Board, Grade 9 and 10:
Grade 9: Physics, Chemistry, Biology, Mathematics, English, Urdu, Islamiyat, Pakistan Studies, Computer Science
Grade 10: Physics, Chemistry, Biology, Mathematics, English, Urdu, Islamiyat, Pakistan Studies, Computer Science

For each subject, set:
- name: English name
- nameUrdu: Urdu name (e.g., طبیعیات for Physics)
- grade: enum value
- board: punjab

Add seed script to package.json: "seed": "npx ts-node prisma/seed.ts"
Run: npm run seed

Also add to package.json prisma section:
"prisma": { "seed": "npx ts-node prisma/seed.ts" }

After seeding, verify in Prisma Studio that Subject table has records.
```

---

## Acceptance Criteria — test ALL of these before Phase 4

```
□ Log in as content_editor role user
□ Navigate to /admin/past-papers/upload
□ Upload a real PDF from your computer
□ PDF appears in Cloudinary dashboard under imtihan/past-papers/ folder
□ PastPaper record appears in Prisma Studio with cloudinaryUrl and cloudinaryId
□ Navigate to /admin/past-papers — paper appears in table
□ Log in as student
□ Navigate to /student/past-papers — browsing page loads
□ Filter by Punjab Board → Grade 9 → Biology — filtered results show
□ Click on a paper — individual paper page loads
□ Free student sees paywall after page 2
□ Visit public URL /past-papers/punjab/nine/biology/2023 — page loads without login
□ Page has correct <title> tag for SEO (check browser tab)
□ /sitemap.xml returns valid XML with paper URLs
□ Delete a paper as content_editor — disappears from list (soft deleted)
□ Student trying to access /admin/past-papers → redirected to /unauthorized
□ No TypeScript errors (npx tsc --noEmit)
```
