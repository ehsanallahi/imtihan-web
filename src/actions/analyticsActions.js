'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getChapterMastery() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;

    // 1. Get all subjects the student is enrolled in
    const profile = await db.studentProfile.findUnique({
      where: { userId },
      include: {
        subjects: {
          include: {
            chapters: {
              orderBy: { number: 'asc' }
            }
          }
        }
      }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    // 2. Fetch all MCQ attempts for this student
    const attempts = await db.mCQAttempt.findMany({
      where: {
        examSession: {
          studentId: userId
        }
      },
      include: {
        mcq: {
          select: {
            chapterId: true,
            subjectId: true
          }
        }
      }
    });

    // 3. Aggregate data by chapter
    const stats = {};

    attempts.forEach(attempt => {
      const chapterId = attempt.mcq.chapterId;
      if (!chapterId) return;

      if (!stats[chapterId]) {
        stats[chapterId] = {
          correct: 0,
          total: 0
        };
      }

      stats[chapterId].total += 1;
      if (attempt.isCorrect) {
        stats[chapterId].correct += 1;
      }
    });

    // 4. Map back to subjects and chapters structure
    const masteryData = profile.subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      chapters: subject.chapters.map(chapter => {
        const chapterStat = stats[chapter.id] || { correct: 0, total: 0 };
        const mastery = chapterStat.total > 0 
          ? Math.round((chapterStat.correct / chapterStat.total) * 100) 
          : 0;
        
        return {
          id: chapter.id,
          name: chapter.name,
          number: chapter.number,
          mastery,
          totalAttempts: chapterStat.total,
          correctAttempts: chapterStat.correct
        };
      })
    }));

    return { success: true, data: masteryData };

  } catch (error) {
    console.error("GET_CHAPTER_MASTERY_ERROR:", error);
    return { success: false, error: "Failed to load mastery data" };
  }
}
