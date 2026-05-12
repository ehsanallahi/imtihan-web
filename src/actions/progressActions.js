'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Calculates a student's progress for each chapter in a given subject.
 * @param {string} subjectId 
 * @returns {Promise<{success: boolean, progress?: Record<string, any>, error?: string}>}
 */
export async function getSubjectProgress(subjectId) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    if (!userId) return { success: false, error: "User ID missing from session" };

    const profile = await db.studentProfile.findFirst({
      where: { userId: String(userId) }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    // Get all chapters for this subject
    const chapters = await db.chapter.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: { mcqs: true }
        }
      }
    });

    // Get the student's progress (solved MCQs) for these chapters
    const solvedMcqs = await db.studentMCQProgress.findMany({
      where: {
        studentProfileId: profile.id,
        mcq: { subjectId }
      },
      select: {
        mcqId: true,
        mcq: {
          select: { chapterId: true }
        }
      }
    });

    const progressMap = {};
    
    // Initialize map
    chapters.forEach(ch => {
      progressMap[ch.id] = {
        total: ch._count.mcqs,
        solved: 0,
        percent: 0
      };
    });

    // Count solved per chapter
    solvedMcqs.forEach(record => {
      if (record.mcq?.chapterId && progressMap[record.mcq.chapterId]) {
        progressMap[record.mcq.chapterId].solved += 1;
      }
    });

    // Calculate percentages
    Object.keys(progressMap).forEach(id => {
      const { solved, total } = progressMap[id];
      progressMap[id].percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    });

    return { success: true, progress: progressMap };
  } catch (error) {
    console.error("GET_SUBJECT_PROGRESS_ERROR:", error);
    return { success: false, error: "Failed to calculate subject progress" };
  }
}

/**
 * Calculates overall progress for all subjects the student has interacted with.
 */
export async function getAllSubjectsProgress() {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    if (!userId) return { success: false, error: "User ID missing from session" };

    const profile = await db.studentProfile.findFirst({
      where: { userId: String(userId) }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    // Get count of MCQs per subject
    const subjectTotals = await db.mCQ.groupBy({
      by: ['subjectId'],
      _count: { id: true }
    });

    // Get solved MCQs per subject
    const solvedPerSubject = await db.studentMCQProgress.findMany({
      where: { studentProfileId: profile.id },
      include: {
        mcq: { select: { subjectId: true } }
      }
    });

    const stats = {};
    
    subjectTotals.forEach(item => {
      stats[item.subjectId] = { total: item._count.id, solved: 0, percent: 0 };
    });

    solvedPerSubject.forEach(item => {
      if (item.mcq?.subjectId && stats[item.mcq.subjectId]) {
        stats[item.mcq.subjectId].solved += 1;
      }
    });

    Object.keys(stats).forEach(id => {
      const { solved, total } = stats[id];
      stats[id].percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    });

    return { success: true, progress: stats };
  } catch (error) {
    console.error("GET_ALL_SUBJECTS_PROGRESS_ERROR:", error);
    return { success: false, error: "Failed to calculate overall progress" };
  }
}

/**
 * Fetches the student's daily goal progress.
 */
export async function getDailyGoalProgress() {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    if (!userId) return { success: false, error: "User ID missing from session" };

    const profile = await db.studentProfile.findFirst({
      where: { userId: String(userId) }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const examSessions = await db.examSession.findMany({
      where: {
        studentId: userId,
        completedAt: { gte: startOfToday }
      },
      select: { totalQuestions: true }
    });

    const currentCount = examSessions.reduce((acc, s) => acc + s.totalQuestions, 0);
    const goal = profile.dailyGoalCount || 20;

    return {
      success: true,
      data: {
        current: currentCount,
        goal,
        percent: Math.min(100, Math.round((currentCount / goal) * 100))
      }
    };
  } catch (error) {
    console.error("GET_DAILY_GOAL_PROGRESS_ERROR:", error);
    return { success: false, error: "Failed to fetch daily goal" };
  }
}
