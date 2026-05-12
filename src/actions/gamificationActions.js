'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Fetches all possible achievements and calculates the student's progress towards them.
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getStudentGamificationData() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Fetch the student profile for streak data
    const profile = await db.studentProfile.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: { achievement: true }
        }
      }
    });

    if (!profile) {
      return { success: false, error: "Student profile not found" };
    }

    // Fetch all available achievements
    const allAchievements = await db.achievement.findMany({
      orderBy: { createdAt: "asc" }
    });

    // Fetch exam session statistics for progress calculation
    const examStats = await db.examSession.aggregate({
      where: { studentId: userId, completedAt: { not: null } },
      _count: { id: true },
      _sum: { correctAnswers: true, totalQuestions: true }
    });

    const totalExams = examStats._count.id || 0;
    const totalCorrect = examStats._sum.correctAnswers || 0;

    // Determine unlocked achievement IDs
    const unlockedIds = profile.achievements.map(a => a.achievementId);

    // Map achievements to include unlock status and calculated progress
    const achievementsWithProgress = allAchievements.map(ach => {
      const isUnlocked = unlockedIds.includes(ach.id);
      let progress = 0;
      let target = 1;

      switch (ach.criteria) {
        case "1_quiz_completed":
          target = 1;
          progress = totalExams;
          break;
        case "100_mcqs_correct":
          target = 100;
          progress = totalCorrect;
          break;
        case "100_percent_score":
          target = 1;
          progress = isUnlocked ? 1 : 0;
          break;
        case "7_day_streak":
          target = 7;
          progress = profile.studyStreak;
          break;
        case "30_day_streak":
          target = 30;
          progress = profile.studyStreak;
          break;
        case "early_bird":
        case "night_owl":
        case "subject_master":
          target = 1;
          progress = isUnlocked ? 1 : 0;
          break;
        case "5_reviews_cleared":
          target = 5;
          progress = profile.reviewsClearedCount || 0;
          break;
        default:
          target = 1;
          progress = isUnlocked ? 1 : 0;
      }

      // Ensure progress doesn't exceed target
      progress = Math.min(progress, target);

      return {
        ...ach,
        isUnlocked,
        unlockedAt: isUnlocked ? profile.achievements.find(a => a.achievementId === ach.id).unlockedAt : null,
        progress,
        target,
        progressPercentage: Math.round((progress / target) * 100)
      };
    });

    return {
      success: true,
      data: {
        profile: {
          studyStreak: profile.studyStreak,
          longestStreak: profile.longestStreak || profile.studyStreak,
          reviewsClearedCount: profile.reviewsClearedCount || 0,
        },
        achievements: achievementsWithProgress
      }
    };
  } catch (error) {
    console.error("Failed to fetch gamification data:", error);
    return { success: false, error: "Failed to fetch gamification data" };
  }
}
