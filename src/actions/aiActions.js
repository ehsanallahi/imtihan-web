'use server'
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getTutorResponse } from "@/lib/services/ai-service";
import { revalidatePath } from "next/cache";

const FREE_USER_DAILY_LIMIT = 5;

/**
 * Handles a student's doubt about an MCQ.
 * @param {string} mcqId 
 * @param {string} doubt 
 * @param {string} threadId - Optional, if continuing an existing thread.
 */
export async function askAiTutor(mcqId, doubt, threadId = null) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const isPremium = session.user.role === 'premium_student' || session.user.role === 'super_admin'; // Adjust roles as needed

    // Check usage limits for free users
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isPremium) {
      const usage = await db.aiUsage.findUnique({
        where: { userId_date: { userId, date: today } }
      });

      if (usage && usage.count >= FREE_USER_DAILY_LIMIT) {
        return { 
          success: false, 
          error: `You've reached your daily limit of ${FREE_USER_DAILY_LIMIT} AI questions. Upgrade to Premium for unlimited access!` 
        };
      }
    }

    // Get or create StudentProfile
    let profile = await db.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await db.studentProfile.create({
        data: { userId }
      });
    }

    // Fetch MCQ context
    const mcq = await db.mCQ.findUnique({
      where: { id: mcqId }
    });

    if (!mcq) return { success: false, error: "MCQ not found" };

    let currentThreadId = threadId;
    let history = [];

    if (!currentThreadId) {
      const newThread = await db.doubtThread.create({
        data: {
          studentProfileId: profile.id,
          mcqId: mcqId,
        }
      });
      currentThreadId = newThread.id;
    } else {
      history = await db.doubtMessage.findMany({
        where: { threadId: currentThreadId },
        orderBy: { createdAt: 'asc' }
      });
    }

    // Save student's doubt
    await db.doubtMessage.create({
      data: {
        threadId: currentThreadId,
        senderRole: 'student',
        content: doubt
      }
    });

    // Get AI Response
    const context = {
      question: mcq.question,
      optionA: mcq.optionA,
      optionB: mcq.optionB,
      optionC: mcq.optionC,
      optionD: mcq.optionD,
      correctAnswer: mcq.correctAnswer,
      explanation: mcq.explanation,
      doubt: doubt
    };

    const aiResponse = await getTutorResponse(context, history);

    // Save AI's response
    await db.doubtMessage.create({
      data: {
        threadId: currentThreadId,
        senderRole: 'ai',
        content: aiResponse
      }
    });

    // Update usage count
    await db.aiUsage.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, count: 1 },
      update: { count: { increment: 1 } }
    });

    revalidatePath(`/dashboard`); // Or specific quiz page
    return { success: true, threadId: currentThreadId, aiResponse };

  } catch (error) {
    console.error("AI_TUTOR_ACTION_ERROR:", error);
    return { success: false, error: "Failed to get help from AI Tutor. Please try again later." };
  }
}

/**
 * Fetches the doubt history for a specific MCQ.
 */
export async function getDoubtHistory(mcqId) {
  try {
    const session = await auth();
    if (!session) return null;

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return null;

    const thread = await db.doubtThread.findFirst({
      where: {
        studentProfileId: profile.id,
        mcqId: mcqId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return thread;
  } catch (error) {
    console.error("GET_DOUBT_HISTORY_ERROR:", error);
    return null;
  }
}
