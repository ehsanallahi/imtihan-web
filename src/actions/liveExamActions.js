'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getUpcomingLiveExams() {
  try {
    const today = new Date();
    let exams = await db.liveExam.findMany({
      where: {
        endTime: { gte: today },
        isPublished: true
      },
      include: {
        subject: { select: { name: true } },
        _count: { select: { sessions: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    // Self-seed for development if empty
    if (exams.length === 0 && process.env.NODE_ENV === 'development') {
      const subject = await db.subject.findFirst();
      if (subject) {
        const now = new Date();
        const startSoon = new Date(now.getTime() + (60 * 60 * 1000));
        const endSoon = new Date(startSoon.getTime() + (60 * 60 * 1000));
        
        await db.liveExam.create({
          data: {
            title: 'National Mathematics Mock Exam',
            subjectId: subject.id,
            startTime: startSoon,
            endTime: endSoon,
            durationMinutes: 60,
            totalQuestions: 50,
            isPublished: true
          }
        });
        
        // Refetch
        exams = await db.liveExam.findMany({
          where: { endTime: { gte: today }, isPublished: true },
          include: { subject: { select: { name: true } }, _count: { select: { sessions: true } } },
          orderBy: { startTime: 'asc' }
        });
      }
    }

    return exams;
  } catch (error) {
    console.error("GET_UPCOMING_LIVE_EXAMS_ERROR:", error);
    return [];
  }
}

export async function joinLiveExam(liveExamId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    
    // Check if already joined
    const existingSession = await db.examSession.findFirst({
      where: {
        studentId: userId,
        liveExamId
      }
    });

    if (existingSession) {
      if (existingSession.completedAt) return { success: false, error: "You already completed this exam!" };
      return { success: true, sessionId: existingSession.id };
    }

    const liveExam = await db.liveExam.findUnique({ where: { id: liveExamId } });
    if (!liveExam) return { success: false, error: "Exam not found" };

    const startTime = new Date(liveExam.startTime);
    const endTime = new Date(liveExam.endTime);
    const now = new Date();

    if (now < startTime) return { success: false, error: "Exam has not started yet!" };
    if (now > endTime) return { success: false, error: "Exam has already ended!" };

    // Create new exam session
    const newSession = await db.examSession.create({
      data: {
        studentId: userId,
        liveExamId,
        sessionType: 'mock_exam',
        subjectId: liveExam.subjectId,
        totalQuestions: liveExam.totalQuestions,
        timeLimitMinutes: liveExam.durationMinutes
      }
    });

    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error("JOIN_LIVE_EXAM_ERROR:", error);
    return { success: false, error: "Failed to join live exam" };
  }
}

export async function getLiveExamLeaderboard(liveExamId) {
  try {
    const sessions = await db.examSession.findMany({
      where: {
        liveExamId,
        completedAt: { not: null }
      },
      include: {
        student: { select: { name: true, avatar: true } }
      },
      orderBy: [
        { correctAnswers: 'desc' },
        { timeTakenSeconds: 'asc' }
      ],
      take: 20
    });

    return sessions;
  } catch (error) {
    console.error("GET_LIVE_EXAM_LEADERBOARD_ERROR:", error);
    return [];
  }
}
