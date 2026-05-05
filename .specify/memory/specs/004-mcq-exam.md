# PHASE 4 SPEC — MCQ Bank & Exam Session Flow
**Feature ID:** 004-mcq-exam  
**Phase:** 4 of 8  
**Depends on:** Phase 1 + 2 + 3 complete and tested  
**Estimated time:** Day 9–12  
**Test before proceeding:** All items in Acceptance Criteria must pass

---

## What this phase delivers
Manual MCQ bank (before AI generation), complete exam attempt flow with timer, result saving, and a basic performance dashboard. Teachers can create MCQ sets and assign them to students.

---

## Step-by-step Antigravity directives

### STEP 1 — MCQ management (teacher + content_editor)

```
/implement
Create MCQ creation and management for teachers and content editors.

FILE: src/actions/mcq.ts ('use server')
Functions to create:

createMcq(data):
- Check permission: teacher or content_editor or super_admin
- Validate: question not empty, all 4 options not empty, correctAnswer is A/B/C/D
- Create MCQ in Prisma with isAiGenerated: false, isApproved: true
- Return created MCQ

updateMcq(id, data):
- Check permission: creator or super_admin only
- Update fields
- Return updated MCQ

deleteMcq(id):
- Soft delete: set deletedAt
- Check permission

getMcqsBySubject(subjectId, filters):
- Filter by: difficulty, chapterId, isAiGenerated, topicTag
- Return paginated results (20 per page)

FILE: src/app/(teacher)/mcq-bank/page.tsx
- Table showing all MCQs created by this teacher
- Columns: Question (truncated), Subject, Chapter, Difficulty, Topic Tag, Actions
- Filter: by subject, by difficulty, by chapter
- Create MCQ button → opens dialog

FILE: src/components/teacher/CreateMcqDialog.tsx
'use client' component using shadcn Dialog.
Form fields:
- Subject: Select (fetched from Prisma)
- Chapter: Select (updates when subject changes)
- Question: Textarea (required)
- Option A, B, C, D: Input fields (all required)
- Correct Answer: Radio group (A / B / C / D) — show in teal when selected
- Explanation: Textarea (optional but encouraged)
- Difficulty: Select (easy, medium, hard)
- Topic Tag: Input (e.g., "osmosis", "photosynthesis")

Uses React Hook Form + Zod schema.
Submit calls createMcq server action.
On success: show toast, close dialog, refresh MCQ list.

FILE: src/app/(admin)/mcq-bank/page.tsx
Same as teacher view but shows ALL MCQs across all subjects.
Additional column: Created By.
Super admin can delete any MCQ.
Content editor can create/edit MCQs for any subject.
```

---

### STEP 2 — Exam session flow (student)

```
/implement
Create the complete exam attempt flow for students.

FILE: src/app/(student)/practice/page.tsx
Exam configuration page.
Student selects:
- Subject: Select (fetched from Prisma)
- Chapter: Select (optional — "All chapters" if not selected)
- Difficulty: Select (easy, medium, hard, mixed)
- Number of questions: Radio (10, 20, 30, 50)
- Time limit: Toggle (on/off) + minutes selector if on

On "Start Practice" button:
- POST to /api/exam/start with config
- Redirect to /student/practice/[sessionId]

FILE: src/app/api/exam/start/route.ts
POST handler:
- Validate session + student role
- Fetch MCQs matching filters from Prisma (random order using: orderBy: { id: 'asc' }, take: n — use shuffle in memory)
- Create ExamSession record with status 'in_progress'
- Return: { sessionId, questions: MCQ[] (without correct answers!) }
IMPORTANT: Never send correctAnswer to client before submission

FILE: src/app/(student)/practice/[sessionId]/page.tsx
'use client' component — the actual exam interface.

Layout:
- Top bar: Subject name, Question counter (Q 3 of 20), Timer (if enabled), Pause button
- Main: Question text (large, readable)
  If questionUrdu exists: show Urdu version below in font-urdu class, RTL direction
- Options: 4 radio buttons (A, B, C, D) in JetBrains Mono font
  Selected option highlights in teal-100 with teal-600 border
- Bottom: Previous, Next, Submit (on last question) or End Exam button
- Question navigator: small numbered grid on sidebar showing: unanswered (gray), answered (teal), current (teal-600)

State management with Zustand:
- Store: currentQuestion, answers (map of questionId → selectedAnswer), timeRemaining
- Auto-save answers to localStorage every 30 seconds (in case of crash)

Timer: countdown in MM:SS format, turns crimson-400 when under 2 minutes

On Submit: 
- POST to /api/exam/submit with sessionId and answers map
- Navigate to /student/practice/[sessionId]/results

FILE: src/app/api/exam/submit/route.ts
POST handler:
- Accept: sessionId, answers: { [mcqId]: string }
- For each answer: compare with MCQ.correctAnswer
- Create MCQAttempt records for each answer
- Calculate score: correctAnswers / totalQuestions * 100
- Update ExamSession: correctAnswers, timeTakenSeconds, completedAt
- Return: { score, correctAnswers, totalQuestions, results: [{ mcqId, selected, correct, explanation }] }

FILE: src/app/(student)/practice/[sessionId]/results/page.tsx
Server component — fetches session results.

Show:
- Score circle: large percentage in teal (e.g., 85%) or crimson if below 40%
- Stats bar: Correct (teal), Wrong (crimson), Skipped (gray)
- Time taken
- Question review: each MCQ showing:
  - Question text
  - Student's answer (highlighted green if correct, red if wrong)
  - Correct answer (always shown)
  - Explanation (if available)
- Bottom: "Practice weak topics" button (Phase 6) + "Try another" button
```

---

### STEP 3 — Student performance dashboard

```
/implement
Update the student dashboard with real performance data.

FILE: src/app/(student)/dashboard/page.tsx (UPDATE the existing file)
Server component. Fetch real data from Prisma for logged-in student.

Stat cards to show with real data:
1. MCQs Today: count of MCQAttempts created today
2. Study Streak: StudentProfile.studyStreak
3. Average Score: average score across all completed ExamSessions this week
4. Total Exams: count of completed ExamSessions

Recent activity section:
- List last 5 ExamSessions with: subject, score, date, link to results
- Use shadcn Card for each

Quick start buttons:
- "Practice Now" → /student/practice
- "Past Papers" → /student/past-papers
- "AI Tutor" → /student/ai-tutor (Phase 7 — show as "Coming Soon" badge for now)

Study streak logic: 
Create updateStudyStreak server action that:
- Checks if student attempted any MCQ today
- If yes and no attempt yesterday: reset streak to 1
- If yes and attempt yesterday: increment streak by 1
- Update StudentProfile.studyStreak
- Call this from exam submit endpoint

FILE: src/app/(student)/my-exams/page.tsx
History of all exam sessions.
Table: Date, Subject, Score, Questions, Time, View Results link.
Sort by date descending.
Filter by subject.
```

---

### STEP 4 — Teacher test assignment

```
/implement
Allow teachers to create and assign tests to students.

FILE: src/actions/assignment.ts ('use server')
createAssignment(data):
- Teacher selects: MCQs (from their bank), class/student list, due date, time limit
- Create Assignment record in Prisma (add Assignment model if not in schema — add it now)
- Add Assignment model to schema:
  id, title, teacherId, mcqIds (String[] - array of MCQ ids), 
  dueDate DateTime?, timeLimitMinutes Int?, createdAt, updatedAt
- Run: npx prisma migrate dev --name add-assignment

FILE: src/app/(teacher)/assignments/create/page.tsx
Form:
- Test title
- Select MCQs from bank (searchable multi-select using shadcn Command component)
- Due date (shadcn DatePicker)
- Time limit toggle + minutes
- Submit: calls createAssignment action
```

---

## Acceptance Criteria — test ALL of these before Phase 5

```
□ Log in as teacher → create 5 MCQs for Punjab Board Biology Grade 9
□ All 5 MCQs appear in /teacher/mcq-bank table
□ Log in as student → go to /student/practice
□ Configure exam: Biology, 5 questions, no time limit → Start
□ Exam interface loads with first question
□ Select answers for all 5 questions using radio buttons
□ Selected option shows teal highlight
□ Question navigator shows answered questions in teal
□ Submit exam → results page loads
□ Results show correct score percentage
□ Correct answers highlighted green, wrong answers highlighted red
□ Explanation shown for each question
□ Return to dashboard → stats show updated MCQ count
□ Student dashboard shows real data (not placeholder zeros)
□ Create assignment as teacher with 3 MCQs → appears in assignments list
□ npx tsc --noEmit → no TypeScript errors
□ Test on mobile 375px → exam interface is usable on small screen
```
