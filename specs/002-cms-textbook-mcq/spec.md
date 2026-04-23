# Feature Specification: Content Management System

**Feature Branch**: `002-cms-textbook-mcq`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "Build the Imtihan content management system by finalizing the UI for textbook uploads and AI-powered MCQ generation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Textbook PDF Upload (Priority: P1)

As a Content Editor, I want to upload a PDF version of a textbook and associate it with a specific Subject and Chapter, so that the system knows the source of future questions.

**Why this priority**: Essential first step in the content pipeline. Without source material, no questions can be generated.

**Independent Test**: Can be fully tested by uploading a sample PDF and verifying it appears in the "Pending" list with the correct metadata.

**Acceptance Scenarios**:

1. **Given** a user is logged in as `content_editor`, **When** they navigate to /dashboard/content and upload a 10MB PDF for "Physics" Chapter 1, **Then** the file is saved to Cloudinary and a database record is created.
2. **Given** a non-PDF file is selected, **When** the user attempts to upload, **Then** an error message is shown and the upload is blocked.

---

### User Story 2 - AI MCQ Generation (Priority: P1)

As a Content Editor, I want to trigger AI generation for an uploaded textbook, so that the system automatically creates high-quality MCQs without manual typing.

**Why this priority**: This is the core value proposition of the platform (AI-powered efficiency).

**Independent Test**: Can be tested by clicking "Generate" on a valid upload and verifying that a list of MCQs is produced within 30 seconds.

**Acceptance Scenarios**:

1. **Given** a valid PDF upload exists, **When** the editor clicks "Generate MCQs", **Then** the system sends the text content to the AI and creates at least 10 MCQ records in the database.
2. **Given** the AI generation fails, **When** the process times out, **Then** the upload status is set to "Failed" and the user is notified.

---

### User Story 3 - Bilingual Content Support (Priority: P2)

As a Student (end-user), I want the generated MCQs to be available in both English and Urdu, so that I can study in my preferred language.

**Why this priority**: Required for the local market context where bilingual support is a key differentiator.

**Independent Test**: Verify that a generated MCQ contains both `text` and `textUrdu` fields that are linguistically accurate.

**Acceptance Scenarios**:

1. **Given** a successful AI generation, **When** viewing the results, **Then** every question and option must have a corresponding Urdu translation.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support PDF uploads up to 50MB.
- **FR-002**: System MUST store PDFs in Cloudinary and save URLs in the `TextbookUpload` table.
- **FR-003**: System MUST provide a status dashboard (Pending, Processing, Completed, Failed).
- **FR-004**: System MUST use Gemini API to extract key concepts and generate MCQs.
- **FR-005**: Generated MCQs MUST include 4 options, 1 correct answer, and an explanation.
- **FR-006**: System MUST enforce Casbin permissions: only `super_admin` and `content_editor` can access CMS tools.

### Key Entities

- **TextbookUpload**: Represents the source PDF, its storage metadata, and processing status.
- **MCQ**: Represents the generated question, its bilingual text, options, and relation to the source upload.
- **Subject/Chapter**: Existing entities that provide the organizational context for the content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload a PDF and assign metadata in under 60 seconds.
- **SC-002**: AI generation for a standard chapter (20-30 pages) completes in under 45 seconds.
- **SC-003**: 95% of generated MCQs pass initial automated validation (correct number of options, correct answer specified).
- **SC-004**: System supports concurrent processing of 5 uploads per organization.

## Assumptions

- [Assumption] Cloudinary is already configured and accessible.
- [Assumption] Gemini API keys are provided and have sufficient quota.
- [Assumption] PDF text extraction is reliable for standard textbook layouts.
- [Dependency] Relies on the already implemented Authentication and RBAC system.
