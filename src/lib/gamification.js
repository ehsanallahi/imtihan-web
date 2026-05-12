import { db } from "@/lib/db";

export async function processGamification(userId, totalQuestions, correctAnswers, sessionType = "practice") {
  try {
    let profile = await db.studentProfile.findUnique({
      where: { userId },
      include: { achievements: true }
    });

    if (!profile) {
      profile = await db.studentProfile.create({
        data: { userId },
        include: { achievements: true }
      });
    }

    const now = new Date();
    let newStreak = profile.studyStreak;
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const examsToday = await db.examSession.count({
      where: {
        studentId: userId,
        completedAt: { gte: startOfToday }
      }
    });

    const examsYesterday = await db.examSession.count({
      where: {
        studentId: userId,
        completedAt: { gte: startOfYesterday, lt: startOfToday }
      }
    });

    // Streak logic
    if (examsToday === 1) { 
      if (examsYesterday > 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newTotalMcqs = profile.totalMcqsAttempted + totalQuestions;
    const newLongestStreak = Math.max(profile.longestStreak, newStreak);

    // Fetch total correct answers across all time for "100_mcqs_correct"
    const stats = await db.examSession.aggregate({
      where: { studentId: userId, completedAt: { not: null } },
      _sum: { correctAnswers: true }
    });
    const totalCorrectAllTime = (stats._sum.correctAnswers || 0);

    await db.studentProfile.update({
      where: { id: profile.id },
      data: {
        studyStreak: newStreak,
        longestStreak: newLongestStreak,
        totalMcqsAttempted: newTotalMcqs
      }
    });

    // --- Badge Logic ---
    const earnedAchievementIds = profile.achievements.map(a => a.achievementId);
    
    const availableAchievements = await db.achievement.findMany({
      where: { id: { notIn: earnedAchievementIds } }
    });

    const newAchievementsToAward = [];
    const currentHour = now.getHours();

    for (const achievement of availableAchievements) {
      let earned = false;
      
      switch (achievement.criteria) {
        case "1_quiz_completed":
          if (newTotalMcqs > 0) earned = true;
          break;
        case "100_mcqs_correct":
          if (totalCorrectAllTime >= 100) earned = true;
          break;
        case "100_percent_score":
          if (totalQuestions > 0 && correctAnswers === totalQuestions) earned = true;
          break;
        case "7_day_streak":
          if (newStreak >= 7) earned = true;
          break;
        case "30_day_streak":
          if (newStreak >= 30) earned = true;
          break;
        case "early_bird":
          if (currentHour >= 4 && currentHour < 8) earned = true;
          break;
        case "night_owl":
          if (currentHour >= 22 || currentHour < 2) earned = true;
          break;
        case "subject_master":
          if (sessionType === "mock_exam" && totalQuestions >= 10 && (correctAnswers / totalQuestions) >= 0.9) {
            earned = true;
          }
          break;
        case "5_reviews_cleared":
          if (profile.reviewsClearedCount >= 5) earned = true;
          break;
      }

      if (earned) {
        newAchievementsToAward.push({
          studentProfileId: profile.id,
          achievementId: achievement.id
        });
      }
    }

    if (newAchievementsToAward.length > 0) {
      await db.studentAchievement.createMany({
        data: newAchievementsToAward
      });
      console.log(`Awarded ${newAchievementsToAward.length} new achievements to user ${userId}`);
      
      // Fetch the full achievement details to return to the UI
      const awardedIds = newAchievementsToAward.map(a => a.achievementId);
      const fullAchievements = await db.achievement.findMany({
        where: { id: { in: awardedIds } }
      });
      return fullAchievements;
    }

    return [];
  } catch (error) {
    console.error("Error processing gamification:", error);
    return [];
  }
}
