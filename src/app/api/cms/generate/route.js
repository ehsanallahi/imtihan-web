
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { extractTextFromPDF, cleanExtractedText } from "@/lib/pdf-utils";
import { generateMCQsFromText } from "@/lib/services/ai-service";
import { checkPermission } from "@/lib/casbin";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkPermission(session.user.role, "cms", "write");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { uploadId } = await req.json();
    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID is required" }, { status: 400 });
    }

    // 1. Fetch Upload Metadata
    const upload = await db.textbookUpload.findUnique({
      where: { id: uploadId },
      include: { subject: true, chapter: true }
    });

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // 2. Fetch File from Cloudinary and Extract Text
    const fileResponse = await fetch(upload.cloudinaryUrl);
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    
    const rawText = await extractTextFromPDF(fileBuffer);
    const cleanedText = cleanExtractedText(rawText);

    // 3. Generate MCQs using AI
    const generatedMcqs = await generateMCQsFromText(cleanedText);

    // 4. Save to Database
    const savedMcqs = await Promise.all(
      generatedMcqs.map(async (item) => {
        return db.mCQ.create({
          data: {
            text: item.questionText,
            textUrdu: item.questionTextUrdu,
            explanation: item.explanation,
            explanationUrdu: item.explanationUrdu,
            subjectId: upload.subjectId,
            chapterId: upload.chapterId,
            difficulty: "intermediate",
            options: {
              create: item.options.map(opt => ({
                text: opt.text,
                textUrdu: opt.textUrdu,
                isCorrect: opt.isCorrect
              }))
            }
          }
        });
      })
    );

    // 5. Update Upload Status
    await db.textbookUpload.update({
      where: { id: uploadId },
      data: { mcqsGenerated: true }
    });

    return NextResponse.json({
      message: `Successfully generated ${savedMcqs.length} MCQs`,
      count: savedMcqs.length
    });

  } catch (error) {
    console.error("[CMS_GENERATE_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
