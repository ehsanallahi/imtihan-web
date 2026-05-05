# Implementation Plan: Content Management System

## Goal
Implement a robust UI and backend for uploading textbook PDFs, tracking their status, and triggering AI generation of bilingual MCQs using Gemini.

## User Review Required
> [!IMPORTANT]
> The PDF text extraction strategy needs to be finalized. We will use `pdf-parse` or similar server-side library.

## Proposed Changes

### UI Components

#### [NEW] [UploadCard.js](file:///f:/Work/imtihan/imtihan-web/src/components/cms/UploadCard.js)
- A drag-and-drop zone for PDF uploads.
- Metadata selection (Subject, Chapter).

#### [NEW] [StatusBadge.js](file:///f:/Work/imtihan/imtihan-web/src/components/cms/StatusBadge.js)
- Visual indicators for Pending/Processing/Completed/Failed.

### API Routes

#### [NEW] [upload/route.js](file:///f:/Work/imtihan/imtihan-web/src/app/api/cms/upload/route.js)
- Handles multipart/form-data.
- Uploads to Cloudinary.
- Creates `TextbookUpload` record.

#### [NEW] [generate/route.js](file:///f:/Work/imtihan/imtihan-web/src/app/api/cms/generate/route.js)
- Triggers the AI generation pipeline.
- Uses Gemini Pro 1.5 to analyze text and output JSON MCQs.

### Services

#### [NEW] [ai-service.js](file:///f:/Work/imtihan/imtihan-web/src/lib/services/ai-service.js)
- Encapsulates Gemini API calls.
- Handles prompt engineering for bilingual MCQs.

## Verification Plan

### Automated Tests
- `npm run test:cms` (Unit tests for AI response parsing).

### Manual Verification
- Upload a Physics PDF, check Cloudinary, trigger generation, and verify results in the dashboard.
