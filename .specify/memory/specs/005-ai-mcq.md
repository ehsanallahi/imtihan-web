# PHASE 5 SPEC — AI MCQ Generation (Gemini) + Weak Topic Detection
**Feature ID:** 005-ai-mcq  
**Phase:** 5 of 8  
**Depends on:** Phase 1–4 complete and tested  
**Estimated time:** Day 13–16  
**Test before proceeding:** All items in Acceptance Criteria must pass

---

## What this phase delivers
The core AI differentiator: students upload a textbook chapter PDF → Gemini generates 20 MCQs instantly. Plus the AI doubt solver chatbot, and the weak topic detection engine that personalises practice recommendations.

---

## Step-by-step Antigravity directives

### STEP 1 — PDF upload + Gemini MCQ generation pipeline

```
/implement
Create the AI MCQ generation pipeline from student PDF uploads.

FILE: src/actions/generateMcqs.ts ('use server')
This is the most important file in Phase 5.

Imports:
- cloudinary from '@/lib/cloudinary'
- flashModel from '@/lib/gemini'
- db from '@/lib/db'

Main function: generateMcqsFromUpload(formData: FormData)

Step 1 — Validate:
- Check session: student must be logged in
- Check subscription: free students get 5 AI generations per day max
  Count today's TextbookUploads for this user — reject if >= 5 with message
  Premium students: unlimited
- Get file from formData
- Validate: must be application/pdf, under 25MB
- Extract: subjectId, chapterId (optional) from formData

Step 2 — Upload to Cloudinary:
- Convert file to base64 dataUri
- Upload using cloudinary.uploader.upload with:
  resource_type: 'raw'
  folder: 'imtihan/textbooks'
  use_filename: true
- Save TextbookUpload record to Prisma with cloudinaryUrl, cloudinaryId, uploadedById

Step 3 — Extract text from PDF:
- Use pdf-parse to extract text from the PDF buffer
- If pdf-parse returns empty/minimal text: it's a scanned PDF
  For scanned PDFs: fetch the Cloudinary URL and pass as inline data to Gemini directly
- If text extracted successfully: use text as Gemini input
- Chunk: if text > 15000 characters, take first 15000 only

Step 4 — Generate MCQs with Gemini:
Use flashModel from '@/lib/gemini'

Prompt (use EXACTLY this prompt):
"""
You are an expert Pakistan board exam teacher. Analyze this chapter content and generate exactly 20 high-quality MCQs suitable for Pakistani board exams (grades 9-12).

STRICT RULES:
1. Return ONLY valid JSON, no markdown, no explanation outside JSON
2. Each MCQ must have: question, option_a, option_b, option_c, option_d, correct_answer (must be exactly "A", "B", "C", or "D"), explanation, difficulty ("easy", "medium", or "hard"), topic_tag (2-3 word topic)
3. Questions must test conceptual understanding, not just memorization
4. Include Urdu terms in brackets where commonly used in Pakistan (e.g., "تنفس (Respiration)")
5. Mix difficulty: 6 easy, 9 medium, 5 hard
6. Never repeat similar questions

Return this exact JSON structure:
{ "mcqs": [ { "question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A", "explanation": "...", "difficulty": "medium", "topic_tag": "..." } ] }

Chapter content:
[CHAPTER_TEXT]
"""

Replace [CHAPTER_TEXT] with extracted text.

Step 5 — Parse + validate + save:
- Parse JSON from Gemini response
- Validate each MCQ has all required fields
- Validate correct_answer is A, B, C, or D
- Save each MCQ to Prisma with: isAiGenerated: true, isApproved: false (needs review), subjectId, chapterId
- Update TextbookUpload.mcqsGenerated = true
- Return: { success: true, mcqs: MCQ[], sessionId: string } 
  where sessionId is a new practice session created with these MCQs

IMPORTANT error handling:
- If Gemini returns invalid JSON: retry once with clearer prompt
- If retry fails: return { success: false, error: 'AI generation failed, please try again' }
- Always wrap in try/catch
- Log errors with console.error but never expose to client

FILE: src/app/(student)/ai-generate/page.tsx
'use client' page for the AI MCQ generation feature.

Layout:
- Header: "Generate MCQs from your textbook" (Sora font, teal accent)
- Subtitle: "Upload any chapter PDF and get 20 practice MCQs instantly"
- Subject selector (Select component)
- Chapter selector (Select component, optional)
- Upload area: drag-and-drop zone OR CldUploadWidget button
  Use CldUploadWidget with signatureEndpoint, uploadPreset: 'imtihan_textbooks'
  Show PDF file name after selection
- Generate button: disabled until file selected
- Free tier notice: "X of 5 daily generations remaining" (fetch from server)
- Premium CTA if at limit

Loading state during generation:
- Replace button with progress indicator
- Show messages that cycle every 2 seconds:
  "Reading your chapter..."
  "Identifying key concepts..."
  "Generating questions..."
  "Almost ready..."
- Use teal spinner + message text

On success:
- Show "20 MCQs generated!" toast
- Show preview of first 3 MCQs with options
- "Start Practice" button → creates exam session with generated MCQs → /student/practice/[sessionId]
- "Review all MCQs" accordion showing all 20

On error:
- Show error message in crimson
- "Try again" button

FILE: src/app/(admin)/ai-review/page.tsx
For moderators to review AI-generated MCQs before they go to the public bank.
Show MCQs where isAiGenerated: true and isApproved: false.
Each MCQ: Approve button (sets isApproved: true) or Delete button.
Batch approve all button.
```

---

### STEP 2 — AI Doubt Solver chatbot

```
/implement
Create the AI doubt solver — a subject-aware chat interface powered by Gemini Pro.

FILE: src/app/api/ai/doubt/route.ts
POST handler with streaming response.

Accept: { question: string, subjectId?: string, context?: string }

Validate:
- Session required (any logged-in user)
- Question not empty, max 500 characters
- Rate limit: 20 questions per hour per user (use simple Prisma count check)

Build system prompt:
"""
You are Imtihan AI, a friendly and knowledgeable tutor for Pakistani students preparing for board exams (grades 9-12) and competitive exams (MDCAT, ECAT, CSS, PPSC).

Rules:
1. Explain concepts clearly using simple English
2. Add Urdu terms in brackets where helpful (e.g., "Mitosis میٹوسس")  
3. Use Pakistani curriculum examples and context
4. Keep explanations concise but complete
5. If asked about a specific chapter or topic, relate to Pakistan board syllabus
6. Be encouraging and supportive
7. Never give direct exam answers — teach the concept instead
8. Subject context: [SUBJECT_NAME]
"""

Use proModel.generateContentStream() for streaming response.
Return as ReadableStream using NextResponse with appropriate headers.

FILE: src/app/(student)/ai-tutor/page.tsx
'use client' chat interface.

UI layout:
- Chat messages area (scrollable, flex-col)
- Student message: right-aligned, teal-100 background, rounded
- AI message: left-aligned, white/gray background, rounded
  AI messages support markdown rendering (use a simple markdown parser)
- Input bar at bottom: Textarea + Send button
  Send on Enter (Shift+Enter for newline)
- Subject context selector at top (optional filter)
- "Suggested questions" chips at top when chat is empty:
  "Explain osmosis", "What is Newton's third law?", "How does photosynthesis work?"

Streaming: use fetch with ReadableStream reader, append AI response character by character
Show typing indicator (3 animated dots) while streaming

Store messages in React state (no persistence needed in Phase 5)

FILE: src/components/student/ChatMessage.tsx
Props: role ('user' | 'assistant'), content: string, timestamp: Date
Render Urdu text in font-urdu class if detected (right-to-left)
```

---

### STEP 3 — Weak topic detection engine

```
/implement
Create the weak topic detection that personalises student practice.

FILE: src/actions/analytics.ts ('use server')

Function: getWeakTopics(studentId: string)
Logic:
1. Fetch last 100 MCQAttempts for this student (include MCQ relation with topicTag)
2. Group by topicTag
3. For each topic: calculate accuracy = correct/total * 100
4. Sort by accuracy ascending (weakest first)
5. Return top 5 weakest topics with: topicTag, accuracy, totalAttempted, recommendedMcqIds
6. recommendedMcqIds: find 10 MCQs from that topic the student hasn't tried yet

Function: getSubjectPerformance(studentId: string)
1. Group MCQAttempts by subjectId
2. For each subject: accuracy, totalAttempted, trending (improving/declining)
3. Trending: compare last 20 attempts vs previous 20 for that subject

FILE: src/components/student/WeakTopicsWidget.tsx
'use client' component.
Fetch weak topics using TanStack Query (useQuery calling getWeakTopics).

Show as list of topic cards:
- Topic name (e.g., "Organic Chemistry")
- Accuracy bar: red fill showing weakness (e.g., 35% correct → 35% teal, 65% crimson)
- "Practice this topic" button → creates exam session filtered by this topicTag

If no weak topics yet: show "Complete more practice to see personalised insights"

FILE: src/app/(student)/dashboard/page.tsx (UPDATE)
Add WeakTopicsWidget below the stat cards.
Add SubjectPerformance chart (simple horizontal bar chart using CSS, not a library):
- Each subject: name, accuracy bar (teal fill on gray background)
- Sort by accuracy ascending
```

---

## Acceptance Criteria — test ALL of these before Phase 6

```
□ As student: navigate to /student/ai-generate
□ Select subject (e.g., Biology), upload a real PDF chapter (any Biology textbook page)
□ Click Generate → loading messages appear
□ After 10-30 seconds: "20 MCQs generated!" appears
□ First 3 MCQs preview shows with options
□ Click "Start Practice" → exam session starts with those MCQs
□ Complete 5 MCQs → results show correctly
□ Check Prisma Studio: MCQ table has new records with isAiGenerated: true
□ Check Prisma Studio: TextbookUpload record exists with cloudinaryUrl
□ Check Cloudinary dashboard: PDF appears in imtihan/textbooks/ folder
□ As moderator: navigate to /admin/ai-review → see unreviewed AI MCQs
□ Approve 3 MCQs → isApproved updates to true in Prisma
□ As student: navigate to /student/ai-tutor
□ Type "Explain photosynthesis" → AI responds with streaming text
□ Response includes Pakistani curriculum context
□ After doing 20+ practice MCQs: student dashboard shows weak topics
□ Weak topic accuracy bar renders correctly
□ "Practice this topic" button starts exam with relevant MCQs
□ Rate limit: free student cannot do more than 5 generations in same day (test with Prisma count)
□ npx tsc --noEmit → zero errors
```
