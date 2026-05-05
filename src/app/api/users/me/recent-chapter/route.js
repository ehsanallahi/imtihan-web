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

    // Find the latest session for this user that has a subjectId
    // In a real app, we might want to store the specific chapterId in ExamSession as well
    const latestSession = await db.examSession.findFirst({
      where: { studentId: payload.id },
      orderBy: { createdAt: 'desc' },
      include: {
        subject: {
          include: {
            chapters: {
              take: 1, // Fallback to first chapter if we don't track exact chapter in Session
              orderBy: { number: 'asc' }
            }
          }
        }
      }
    });

    if (!latestSession || !latestSession.subject?.chapters?.[0]) {
      return NextResponse.json(null);
    }

    const chapter = latestSession.subject.chapters[0];

    return NextResponse.json({
      id: chapter.id,
      name: chapter.name,
      questionCount: 0, // Count can be fetched if needed
    });
  } catch (error) {
    console.error("[RECENT_CHAPTER_GET_ERROR]:", error);
    return NextResponse.json(null);
  }
}
