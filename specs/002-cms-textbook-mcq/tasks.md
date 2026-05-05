# Tasks: Content Management System

**Input**: Design documents from `/specs/002-cms-textbook-mcq/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [P] Create directory structure `src/components/cms/`
- [ ] T002 Configure Cloudinary environment variables in `.env`

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T003 [P] Implement `UploadCard.js` component with dropzone
- [x] T004 Implement Cloudinary upload helper in `src/lib/cloudinary.js`

## Phase 3: User Story 1 - Textbook PDF Upload (Priority: P1) 🎯 MVP

- [x] T005 [US1] Create API route `/api/cms/upload` for PDF handling
- [x] T006 [US1] Integrate `UploadCard` with the API route
- [x] T007 [US1] Verify PDF storage in Cloudinary and DB record creation

## Phase 4: User Story 2 - AI MCQ Generation (Priority: P1)

- [x] T008 [US2] Implement `ai-service.js` with Gemini integration
- [x] T009 [US2] Create API route `/api/cms/generate` to trigger AI
- [x] T010 [US2] Implement PDF text extraction logic using `pdf-parse`

## Phase 5: User Story 3 - Bilingual Support (Priority: P2)

- [x] T011 [US3] Update Gemini prompt to require bilingual output (English/Urdu)
- [x] T012 [US3] Add validation for Urdu character encoding in generated results

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 Add progress bar for uploads
- [x] T014 Implement error notifications using Shadcn/UI Toast
- [x] T015 Verify role-based access for all CMS routes
