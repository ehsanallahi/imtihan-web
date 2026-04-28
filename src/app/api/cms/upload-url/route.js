import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary.js";
import { checkPermission } from "@/lib/casbin";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-utils";
import { extractChaptersFromText, normalizeGoogleDriveUrl } from "@/lib/services/ai-service";

/**
 * POST /api/cms/upload-url
 * Accepts a PDF URL and optional subjectId + chapterId.
 * If isFullBook=true, AI splits the PDF into chapters automatically.
 * Otherwise a single TextbookUpload is created for the given chapter.
 */
export async function POST(req) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse body
    const body = await req.json();
    const { pdfUrl, subjectId, chapterId, isFullBook } = body;

    if (!pdfUrl) {
      return NextResponse.json({ error: "pdfUrl is required" }, { status: 400 });
    }
    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }
    if (!isFullBook && !chapterId) {
      return NextResponse.json({ error: "chapterId is required for single-chapter mode" }, { status: 400 });
    }

    // 3. Normalize URL (Google Drive, Dropbox, etc.)
    const normalizedUrl = normalizeGoogleDriveUrl(pdfUrl.trim());

    // 4. Fetch the PDF from the URL server-side
    let pdfBuffer;
    try {
      const response = await fetch(normalizedUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch PDF from URL: ${response.status} ${response.statusText}` },
          { status: 400 }
        );
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("pdf") && !normalizedUrl.endsWith(".pdf") && !pdfUrl.endsWith(".pdf")) {
        return NextResponse.json(
          { error: "The URL does not point to a PDF file. Please provide a direct PDF link." },
          { status: 400 }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } catch (fetchError) {
      console.error("[URL_FETCH_ERROR]:", fetchError);
      return NextResponse.json(
        { error: "Could not fetch the PDF from the provided URL. Make sure the link is publicly accessible." },
        { status: 400 }
      );
    }

    // 5. Extract a display name from the URL
    const urlPathParts = new URL(normalizedUrl).pathname.split("/");
    const guessedName = decodeURIComponent(urlPathParts[urlPathParts.length - 1]) || "textbook.pdf";
    const displayName = guessedName.endsWith(".pdf") ? guessedName : `${guessedName}.pdf`;

    // 6. Upload to Cloudinary (so we have a persistent copy)
    const cloudinaryResult = await uploadToCloudinary(pdfBuffer, "imtihan/textbooks");

    // ── FULL BOOK MODE ──────────────────────────────────────────────────────────
    if (isFullBook) {
      const rawText = await extractTextFromPDF(pdfBuffer);
      const cleanedText = cleanExtractedText(rawText);

      const existingChapters = await db.chapter.findMany({
        where: { subjectId },
        orderBy: { number: "asc" },
        select: { id: true, number: true, name: true },
      });

      const detectedChapters = await extractChaptersFromText(cleanedText, existingChapters);

      if (!detectedChapters.length) {
        return NextResponse.json(
          { error: "AI could not detect any chapters in this PDF." },
          { status: 422 }
        );
      }

      const uploads = [];
      for (const ch of detectedChapters) {
        if (!ch.matchedChapterId) continue;

        const upload = await db.textbookUpload.create({
          data: {
            cloudinaryUrl: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id,
            originalName: `${displayName} — Chapter ${ch.chapterNumber}: ${ch.chapterName}`,
            uploadedById: session.user.id,
            subjectId,
            chapterId: ch.matchedChapterId,
            sourceUrl: pdfUrl,
            isFullBook: true,
            mcqsGenerated: false,
          },
        });
        uploads.push({ ...upload, detectedChapterName: ch.chapterName, chapterNumber: ch.chapterNumber });
      }

      const skipped = detectedChapters.filter((c) => !c.matchedChapterId).length;

      return NextResponse.json({
        message: `Full textbook processed via URL. ${uploads.length} chapter(s) created, ${skipped} unmatched skipped.`,
        uploads,
        detectedChapters,
      });
    }

    // ── SINGLE CHAPTER MODE ─────────────────────────────────────────────────────
    const upload = await db.textbookUpload.create({
      data: {
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        originalName: displayName,
        uploadedById: session.user.id,
        subjectId,
        chapterId,
        sourceUrl: pdfUrl,
        isFullBook: false,
        mcqsGenerated: false,
      },
    });

    return NextResponse.json({
      message: "PDF URL processed and saved successfully.",
      upload,
    });

  } catch (error) {
    console.error("[CMS_UPLOAD_URL_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
