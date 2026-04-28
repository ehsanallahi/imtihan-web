import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary.js";
import { checkPermission } from "@/lib/casbin";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-utils";
import { extractChaptersFromText } from "@/lib/services/ai-service";

// Triggering re-build to clear stale state
export async function POST(req) {
  try {
    // 1. Authenticate and Check Permissions
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file");
    const subjectId = formData.get("subjectId");
    const chapterId = formData.get("chapterId"); // optional for full-book mode
    const isFullBook = formData.get("isFullBook") === "true";

    if (!file || !subjectId) {
      return NextResponse.json({ error: "Missing required fields (file, subjectId)" }, { status: 400 });
    }

    if (!isFullBook && !chapterId) {
      return NextResponse.json({ error: "chapterId is required for single-chapter uploads" }, { status: 400 });
    }

    // 3. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload original PDF to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, "imtihan/textbooks");

    // ── FULL BOOK MODE ──────────────────────────────────────────────────────────
    if (isFullBook) {
      // Extract text and use AI to split chapters
      const rawText = await extractTextFromPDF(buffer);
      const cleanedText = cleanExtractedText(rawText);

      // Get existing chapters for this subject
      const existingChapters = await db.chapter.findMany({
        where: { subjectId },
        orderBy: { number: "asc" },
        select: { id: true, number: true, name: true },
      });

      // AI chapter extraction
      const detectedChapters = await extractChaptersFromText(cleanedText, existingChapters);

      if (!detectedChapters.length) {
        return NextResponse.json({ error: "AI could not detect any chapters in this PDF." }, { status: 422 });
      }

      // Create one TextbookUpload per matched chapter
      const uploads = [];
      for (const ch of detectedChapters) {
        if (!ch.matchedChapterId) continue; // skip unmatched chapters

        const upload = await db.textbookUpload.create({
          data: {
            cloudinaryUrl: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id,
            originalName: `${file.name} — Chapter ${ch.chapterNumber}: ${ch.chapterName}`,
            uploadedById: session.user.id,
            subjectId,
            chapterId: ch.matchedChapterId,
            isFullBook: true,
            mcqsGenerated: false,
          },
        });
        uploads.push({ ...upload, detectedChapterName: ch.chapterName, chapterNumber: ch.chapterNumber });
      }

      const skipped = detectedChapters.filter((c) => !c.matchedChapterId).length;

      return NextResponse.json({
        message: `Full textbook processed. ${uploads.length} chapter(s) created, ${skipped} unmatched skipped.`,
        uploads,
        detectedChapters,
      });
    }

    // ── SINGLE CHAPTER MODE (original behaviour) ────────────────────────────────
    const upload = await db.textbookUpload.create({
      data: {
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        originalName: file.name,
        uploadedById: session.user.id,
        subjectId,
        chapterId,
        isFullBook: false,
        mcqsGenerated: false,
      },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      upload,
    });

  } catch (error) {
    console.error("[CMS_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
