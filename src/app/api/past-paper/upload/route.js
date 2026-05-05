export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/casbin";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-utils";
import { extractPastPaperMetadata, normalizeGoogleDriveUrl } from "@/lib/services/ai-service";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/past-paper/upload
 *
 * Body (multipart/form-data):
 *   file        - PDF file (optional if sourceUrl provided)
 *   sourceUrl   - Direct PDF URL (optional if file provided)
 *
 * Returns: { uploadId, metadata: { board, grade, year, subjectName, medium }, subjectId? }
 * The admin reviews the metadata before triggering processing.
 */
export async function POST(req) {
  try {
    console.log("[PAST_PAPER_UPLOAD]: Request received");
    const session = await auth();
    if (!session?.user) {
      console.error("[PAST_PAPER_UPLOAD]: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      console.error("[PAST_PAPER_UPLOAD]: Forbidden - No permission", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let fileBuffer, originalName, sourceUrl;

    if (contentType.includes("multipart/form-data")) {
      console.log("[PAST_PAPER_UPLOAD]: Handling file upload...");
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file) {
        console.error("[PAST_PAPER_UPLOAD]: No file in form data");
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      originalName = file.name;
    } else {
      console.log("[PAST_PAPER_UPLOAD]: Handling URL ingestion...");
      const body = await req.json();
      sourceUrl = body.sourceUrl;
      originalName = body.filename || sourceUrl.split("/").pop() || "past-paper.pdf";

      if (!sourceUrl) {
        console.error("[PAST_PAPER_UPLOAD]: No sourceUrl in body");
        return NextResponse.json({ error: "sourceUrl is required" }, { status: 400 });
      }

      const normalizedUrl = normalizeGoogleDriveUrl(sourceUrl);
      console.log("[PAST_PAPER_UPLOAD]: Fetching PDF from:", normalizedUrl);
      const response = await fetch(normalizedUrl);
      if (!response.ok) {
        console.error("[PAST_PAPER_UPLOAD]: Failed to fetch PDF from URL", response.status);
        return NextResponse.json({ error: "Failed to download PDF from URL" }, { status: 400 });
      }
      fileBuffer = Buffer.from(await response.arrayBuffer());
    }

    console.log("[PAST_PAPER_UPLOAD]: File buffer size:", fileBuffer.length, "bytes");

    // 1. Extract text for metadata detection
    console.log("[PAST_PAPER_UPLOAD]: Extracting text from PDF...");
    const rawText = await extractTextFromPDF(fileBuffer);
    const cleanedText = cleanExtractedText(rawText);
    console.log("[PAST_PAPER_UPLOAD]: Text extracted, length:", cleanedText.length);

    // 2. AI-detect metadata
    console.log("[PAST_PAPER_UPLOAD]: Detecting metadata with AI...");
    const metadata = await extractPastPaperMetadata(cleanedText, originalName, fileBuffer);
    console.log("[PAST_PAPER_UPLOAD]: Metadata detected:", metadata);

    // 3. Upload PDF to Cloudinary
    console.log("[PAST_PAPER_UPLOAD]: Uploading to Cloudinary...");
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "imtihan/past-papers",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error("[PAST_PAPER_UPLOAD]: Cloudinary error:", error);
            reject(error);
          } else {
            console.log("[PAST_PAPER_UPLOAD]: Cloudinary success");
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });

    // 4. Try to find matching subject in DB based on AI-detected name
    console.log("[PAST_PAPER_UPLOAD]: Finding subject matching:", metadata.subjectName);
    let subjectId = null;
    if (metadata.subjectName) {
      const subject = await db.subject.findFirst({
        where: {
          name: { contains: metadata.subjectName, mode: "insensitive" },
          ...(metadata.grade ? { grade: metadata.grade } : {}),
          ...(metadata.board ? { board: metadata.board } : {}),
        },
      });
      subjectId = subject?.id || null;
      if (subjectId) console.log("[PAST_PAPER_UPLOAD]: Found matching subject:", subject.name);
    }

    // 5. Create PastPaperUpload record
    console.log("[PAST_PAPER_UPLOAD]: Creating database record...");
    const upload = await db.pastPaperUpload.create({
      data: {
        originalName,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        sourceUrl: sourceUrl || null,
        board: metadata.board || "punjab",
        grade: metadata.grade || "ten",
        medium: metadata.medium || "english",
        year: metadata.year || new Date().getFullYear(),
        subjectId: subjectId || (await getOrCreateFallbackSubject(metadata, session.user.id)),
        uploadedById: session.user.id,
        isProcessed: false,
      },
    });

    console.log("[PAST_PAPER_UPLOAD]: Success! ID:", upload.id);
    return NextResponse.json({
      uploadId: upload.id,
      metadata,
      subjectId,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("[PAST_PAPER_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * If no subject found for the paper, return the first subject as a fallback.
 * Admin can reassign from the UI.
 */
async function getOrCreateFallbackSubject(metadata, userId) {
  const fallback = await db.subject.findFirst({ orderBy: { name: "asc" } });
  return fallback?.id || null;
}
