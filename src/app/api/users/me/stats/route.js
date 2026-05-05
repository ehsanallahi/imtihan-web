import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
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

    // 1. Get student profile for streak and total attempts
    const profile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
    });

    // 2. Get all exam sessions to calculate averages
    const sessions = await db.examSession.findMany({
      where: { studentId: payload.id },
      select: {
        totalQuestions: true,
        correctAnswers: true,
      }
    });

    const totalTests = sessions.length;
    let totalCorrect = 0;
    let totalQuestions = 0;

    sessions.forEach(s => {
      totalCorrect += s.correctAnswers;
      totalQuestions += s.totalQuestions;
    });

    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return NextResponse.json({
      testsTaken: totalTests,
      averageAccuracy: accuracy,
      studyStreak: profile?.studyStreak || 0,
      totalQuestionsSolved: profile?.totalMcqsAttempted || 0,
    });
  } catch (error) {
    console.error("[USER_STATS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
