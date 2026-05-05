import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, score, total } = body;

    // 1. Find the chapter to get the subjectId
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      select: { subjectId: true }
    });

    // 2. Create the ExamSession
    const session = await db.examSession.create({
      data: {
        studentId: payload.id,
        sessionType: 'practice',
        subjectId: chapter?.subjectId,
        totalQuestions: total,
        correctAnswers: score,
        completedAt: new Date(),
      }
    });

    // 3. Update Student Profile Stats
    await db.studentProfile.update({
      where: { userId: payload.id },
      data: {
        totalMcqsAttempted: { increment: total },
        // We could also calculate study streaks here in a real production app
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("[PROGRESS_POST_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
