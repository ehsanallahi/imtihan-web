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

    // 4. Fetch the PDF from the URL server-side (with retry logic for slow connections)
    let pdfBuffer;
    let fetchErrorMsg = "";
    
    for (let attempt = 1; attempt <= 3; attempt++) {
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
        if (contentType.includes("text/html")) {
          return NextResponse.json(
            { error: "The provided link returned a web page instead of a raw PDF. If using Google Drive or Dropbox, make sure the file is public and under the size limit." },
            { status: 400 }
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);

        // Strict PDF signature check
        if (pdfBuffer.length < 5 || pdfBuffer.toString('ascii', 0, 5) !== '%PDF-') {
          return NextResponse.json(
            { error: "The downloaded file is not a valid PDF. It might be a login page or an unsupported format." },
            { status: 400 }
          );
        }
        
        // If we reached here, download was successful!
        fetchErrorMsg = "";
        break;

      } catch (err) {
        console.warn(`[URL_FETCH_WARN] Attempt ${attempt} failed:`, err.message);
        fetchErrorMsg = err.message;
        if (attempt === 3) {
          console.error("[URL_FETCH_ERROR]:", err);
        }
      }
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: `Network error downloading the file. Please try again. (${fetchErrorMsg})` },
        { status: 400 }
      );
    }

    // 5. Extract a display name from the URL
    const urlPathParts = new URL(normalizedUrl).pathname.split("/");
    const guessedName = decodeURIComponent(urlPathParts[urlPathParts.length - 1]) || "textbook.pdf";
    const displayName = guessedName.endsWith(".pdf") ? guessedName : `${guessedName}.pdf`;

    // 6. Upload to Cloudinary if file is under 10MB, else fallback to the source URL
    let cloudinaryResult = { secure_url: normalizedUrl, public_id: `external-${Date.now()}` };
    if (pdfBuffer.length <= 10485000) {
      try {
        cloudinaryResult = await uploadToCloudinary(pdfBuffer, "imtihan/textbooks");
      } catch (e) {
        console.warn("[CLOUDINARY_UPLOAD_WARN]: Failed to upload to Cloudinary, falling back to source URL.", e.message);
      }
    }

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
        let currentChapterId = ch.matchedChapterId;

        // Auto-create the chapter in the database if it doesn't exist
        if (!currentChapterId) {
          try {
            const newChapter = await db.chapter.create({
              data: {
                number: ch.chapterNumber || 0,
                name: ch.chapterName || `Chapter ${ch.chapterNumber}`,
                subjectId,
              },
            });
            currentChapterId = newChapter.id;
            ch.matchedChapterId = currentChapterId; // Update the object so the UI shows it as matched/saved!
          } catch (createErr) {
            console.error("Failed to auto-create chapter:", createErr);
            continue; // Skip only if creation fails
          }
        }

        const upload = await db.textbookUpload.create({
          data: {
            cloudinaryUrl: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id,
            originalName: `${displayName} — Chapter ${ch.chapterNumber}: ${ch.chapterName}`,
            uploadedById: session.user.id,
            subjectId,
            chapterId: currentChapterId,
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
