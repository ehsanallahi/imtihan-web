# Tasks: Content Management System

**Input**: Design documents from `/specs/002-cms-textbook-mcq/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Create directory structure `src/components/cms/`
- [ ] T002 Configure Cloudinary environment variables in `.env`

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 [P] Implement `UploadCard.js` component with dropzone
- [ ] T004 Implement Cloudinary upload helper in `src/lib/cloudinary.js`

## Phase 3: User Story 1 - Textbook PDF Upload (Priority: P1) 🎯 MVP

- [ ] T005 [US1] Create API route `/api/cms/upload` for PDF handling
- [ ] T006 [US1] Integrate `UploadCard` with the API route
- [ ] T007 [US1] Verify PDF storage in Cloudinary and DB record creation

## Phase 4: User Story 2 - AI MCQ Generation (Priority: P1)

- [ ] T008 [US2] Implement `ai-service.js` with Gemini integration
- [ ] T009 [US2] Create API route `/api/cms/generate` to trigger AI
- [ ] T010 [US2] Implement PDF text extraction logic using `pdf-parse`

## Phase 5: User Story 3 - Bilingual Support (Priority: P2)

- [ ] T011 [US3] Update Gemini prompt to require bilingual output (English/Urdu)
- [ ] T012 [US3] Add validation for Urdu character encoding in generated results

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T013 Add progress bar for uploads
- [ ] T014 Implement error notifications using Shadcn/UI Toast
- [ ] T015 Verify role-based access for all CMS routes
