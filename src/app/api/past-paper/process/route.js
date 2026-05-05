export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermission } from "@/lib/casbin";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-utils";
import { extractMCQsFromPastPaper } from "@/lib/services/ai-service";

/**
 * POST /api/past-paper/process
 *
 * Body: { uploadId, board?, grade?, year?, medium?, subjectId? }
 * Admin can optionally override metadata at this stage.
 *
 * Flow:
 *  1. Fetch PDF from Cloudinary → extract text
 *  2. AI extracts MCQs from the paper
 *  3. Repeat detection: normalize question text, check against existing PastPaperMCQs for same subject+grade
 *     - Match found  → increment repeatCount, create this record linked via canonicalId
 *     - No match     → create new record with repeatCount = 1
 *  4. Mark upload as processed
 */
export async function POST(req) {
  try {
    console.log("[PAST_PAPER_PROCESS]: Request received");
    const session = await auth();
    if (!session?.user) {
      console.error("[PAST_PAPER_PROCESS]: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      console.error("[PAST_PAPER_PROCESS]: Forbidden", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { uploadId, board, grade, year, medium, subjectId } = body;

    if (!uploadId) {
      console.error("[PAST_PAPER_PROCESS]: uploadId is required");
      return NextResponse.json({ error: "uploadId is required" }, { status: 400 });
    }

    // 1. Fetch upload record
    console.log("[PAST_PAPER_PROCESS]: Fetching upload record:", uploadId);
    const upload = await db.pastPaperUpload.findUnique({ where: { id: uploadId } });
    if (!upload) {
      console.error("[PAST_PAPER_PROCESS]: Upload not found");
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }
    if (upload.isProcessed) {
      console.warn("[PAST_PAPER_PROCESS]: Already processed");
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    // Apply admin overrides
    console.log("[PAST_PAPER_PROCESS]: Updating upload with admin choices...");
    const updatedUpload = await db.pastPaperUpload.update({
      where: { id: uploadId },
      data: {
        ...(board && { board }),
        ...(grade && { grade }),
        ...(year && { year: parseInt(year) }),
        ...(medium && { medium }),
        ...(subjectId && { subjectId }),
      },
    });

    const effectiveBoard = updatedUpload.board;
    const effectiveGrade = updatedUpload.grade;
    const effectiveYear = updatedUpload.year;
    const effectiveMedium = updatedUpload.medium;
    const effectiveSubjectId = updatedUpload.subjectId;

    // 2. Download PDF and extract text
    console.log("[PAST_PAPER_PROCESS]: Downloading PDF from Cloudinary:", updatedUpload.cloudinaryUrl);
    const fileResponse = await fetch(updatedUpload.cloudinaryUrl);
    if (!fileResponse.ok) {
      console.error("[PAST_PAPER_PROCESS]: Failed to fetch PDF from Cloudinary");
      return NextResponse.json({ error: "Failed to fetch PDF from Cloudinary" }, { status: 500 });
    }
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    console.log("[PAST_PAPER_PROCESS]: Extracting text...");
    const rawText = await extractTextFromPDF(fileBuffer);
    const cleanedText = cleanExtractedText(rawText);
    console.log("[PAST_PAPER_PROCESS]: Text extracted, length:", cleanedText.length);

    // 3. AI extracts MCQs
    console.log("[PAST_PAPER_PROCESS]: Extracting MCQs with AI...");
    const extractedMcqs = await extractMCQsFromPastPaper(cleanedText, effectiveMedium, fileBuffer);
    console.log("[PAST_PAPER_PROCESS]: MCQs extracted by AI:", extractedMcqs.length);

    if (extractedMcqs.length === 0) {
      console.warn("[PAST_PAPER_PROCESS]: No MCQs found in paper");
      await db.pastPaperUpload.update({
        where: { id: uploadId },
        data: { isProcessed: true },
      });
      return NextResponse.json({ message: "No MCQs found in this paper", count: 0 });
    }

    // 4. Load existing MCQs for same subject+grade for repeat detection
    console.log("[PAST_PAPER_PROCESS]: Fetching existing MCQs for repeat detection...");
    const existingMcqs = await db.pastPaperMCQ.findMany({
      where: {
        subjectId: effectiveSubjectId,
        grade: effectiveGrade,
        isApproved: true,
        canonicalId: null,
      },
      select: { id: true, question: true, repeatCount: true },
    });
    console.log("[PAST_PAPER_PROCESS]: Found", existingMcqs.length, "existing canonical MCQs");

    const normalizeText = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const existingMap = new Map();
    for (const mcq of existingMcqs) {
      existingMap.set(normalizeText(mcq.question), mcq);
    }

    // 5. Process each extracted MCQ
    console.log("[PAST_PAPER_PROCESS]: Saving extracted MCQs to database...");
    let newCount = 0;
    let repeatCount = 0;

    for (const item of extractedMcqs) {
      const normalizedQ = normalizeText(item.question || "");
      const existing = existingMap.get(normalizedQ);

      if (existing) {
        console.log("[PAST_PAPER_PROCESS]: Found repeat question:", existing.id);
        await db.pastPaperMCQ.update({
          where: { id: existing.id },
          data: { repeatCount: { increment: 1 } },
        });

        await db.pastPaperMCQ.create({
          data: {
            question: item.question || "",
            questionUrdu: item.questionUrdu || null,
            optionA: item.optionA || "",
            optionB: item.optionB || "",
            optionC: item.optionC || "",
            optionD: item.optionD || "",
            correctAnswer: item.correctAnswer || "A",
            explanation: item.explanation || null,
            board: effectiveBoard,
            grade: effectiveGrade,
            medium: effectiveMedium,
            year: effectiveYear,
            subjectId: effectiveSubjectId,
            pastPaperUploadId: uploadId,
            repeatCount: 1,
            canonicalId: existing.id,
            isApproved: true,
          },
        });

        repeatCount++;
      } else {
        const newMcq = await db.pastPaperMCQ.create({
          data: {
            question: item.question || "",
            questionUrdu: item.questionUrdu || null,
            optionA: item.optionA || "",
            optionB: item.optionB || "",
            optionC: item.optionC || "",
            optionD: item.optionD || "",
            correctAnswer: item.correctAnswer || "A",
            explanation: item.explanation || null,
            board: effectiveBoard,
            grade: effectiveGrade,
            medium: effectiveMedium,
            year: effectiveYear,
            subjectId: effectiveSubjectId,
            pastPaperUploadId: uploadId,
            repeatCount: 1,
            canonicalId: null,
            isApproved: true,
          },
        });

        existingMap.set(normalizedQ, { id: newMcq.id, question: item.question, repeatCount: 1 });
        newCount++;
      }
    }

    // 6. Mark upload as processed
    console.log("[PAST_PAPER_PROCESS]: Process complete. Success!");
    await db.pastPaperUpload.update({
      where: { id: uploadId },
      data: { isProcessed: true },
    });

    return NextResponse.json({
      message: `Processed successfully`,
      total: extractedMcqs.length,
      newQuestions: newCount,
      repeatedQuestions: repeatCount,
    });
  } catch (error) {
    console.error("[PAST_PAPER_PROCESS_ERROR]:", error);
    return NextResponse.json(
      { error: "Processing failed", details: error.message },
      { status: 500 }
    );
  }
}
