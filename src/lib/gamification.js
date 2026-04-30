import { db } from "@/lib/db";

export async function processGamification(userId, totalQuestions, correctAnswers) {
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
    
    // Simple streak logic: if last exam was completed yesterday, increment streak.
    // If it was today, keep it. If older, reset to 1.
    // For MVP, we will just query the last completed exam session before today.
    
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

    // If this is the first exam today
    if (examsToday === 1) { 
      if (examsYesterday > 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newTotalMcqs = profile.totalMcqsAttempted + totalQuestions;

    await db.studentProfile.update({
      where: { id: profile.id },
      data: {
        studyStreak: newStreak,
        totalMcqsAttempted: newTotalMcqs
      }
    });

    // --- Badge Logic ---
    const earnedAchievementIds = profile.achievements.map(a => a.achievementId);
    
    const availableAchievements = await db.achievement.findMany({
      where: { id: { notIn: earnedAchievementIds } }
    });

    const newAchievementsToAward = [];

    for (const achievement of availableAchievements) {
      let earned = false;
      
      switch (achievement.criteria) {
        case "first_quiz":
          if (newTotalMcqs > 0) earned = true;
          break;
        case "100_mcqs_solved":
          if (newTotalMcqs >= 100) earned = true;
          break;
        case "7_day_streak":
          if (newStreak >= 7) earned = true;
          break;
        case "perfect_score":
          if (totalQuestions > 0 && correctAnswers === totalQuestions) earned = true;
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
      // In a full implementation, you'd trigger a Notification here
    }

  } catch (error) {
    console.error("Error processing gamification:", error);
  }
}
