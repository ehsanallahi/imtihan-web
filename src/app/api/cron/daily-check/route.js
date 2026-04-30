import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(today);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    // 1. Streak Warnings
    // Find students who practiced yesterday but haven't practiced today
    const studentsWithStreak = await db.studentProfile.findMany({
      where: {
        studyStreak: { gt: 0 },
        user: {
          examSessions: {
            some: {
              completedAt: {
                gte: startOfYesterday,
                lt: today
              }
            },
            none: {
              completedAt: {
                gte: today
              }
            }
          }
        }
      },
      include: { user: true }
    });

    const streakNotifications = studentsWithStreak.map(student => ({
      userId: student.userId,
      title: "Streak at Risk! 🔥",
      message: `Don't let your ${student.studyStreak}-day study streak break! Complete a quick quiz today.`,
      type: "streak_warning"
    }));

    // 2. SRS Review Reminders
    // Find students who have MCQs due for review today
    const studentsWithDueReviews = await db.studentMCQProgress.groupBy({
      by: ['studentProfileId'],
      where: {
        nextReviewDate: { lte: new Date() }
      }
    });

    const studentProfileIds = studentsWithDueReviews.map(s => s.studentProfileId);
    const profilesToNotify = await db.studentProfile.findMany({
      where: { id: { in: studentProfileIds } },
      include: { user: true }
    });

    const srsNotifications = profilesToNotify.map(profile => ({
      userId: profile.userId,
      title: "Knowledge Review Due 🧠",
      message: "You have questions ready for review in your Spaced Repetition queue.",
      type: "exam_reminder"
    }));

    // Batch create notifications
    if (streakNotifications.length > 0 || srsNotifications.length > 0) {
      await db.notification.createMany({
        data: [...streakNotifications, ...srsNotifications]
      });
    }

    return NextResponse.json({ 
      success: true, 
      notified: {
        streaks: streakNotifications.length,
        srs: srsNotifications.length
      }
    });

  } catch (error) {
    console.error("CRON_JOB_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
