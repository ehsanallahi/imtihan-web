'use server'
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getTutorResponse, getGroqTutorResponse, generateChatTitle } from "@/lib/services/ai-service";
import { revalidatePath } from "next/cache";

import { checkAndDeductCredits } from "./creditActions";

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
    
    // Check and deduct credits
    const creditCheck = await checkAndDeductCredits(1);
    if (!creditCheck.allowed) {
      return { success: false, error: creditCheck.error };
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
        senderId: userId,
        senderRole: 'student',
        content: doubt
      }
    });

    // Get AI Response
    const context = {
      question: mcq.question,
      questionUrdu: mcq.questionUrdu,
      optionA: mcq.optionA,
      optionB: mcq.optionB,
      optionC: mcq.optionC,
      optionD: mcq.optionD,
      correctAnswer: mcq.correctAnswer,
      explanation: mcq.explanation,
      doubt: doubt,
      studentMedium: profile.medium // e.g., 'english' or 'urdu'
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

/**
 * Standalone AI Tutor Chat Actions
 */

export async function getChatSessions() {
  try {
    const session = await auth();
    if (!session) return [];

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return [];

    const sessions = await db.aiTutorChat.findMany({
      where: { studentProfileId: profile.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        language: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    return sessions;
  } catch (error) {
    console.error("GET_CHAT_SESSIONS_ERROR:", error);
    return [];
  }
}

export async function getChatHistory(chatId) {
  try {
    const session = await auth();
    if (!session) return null;

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return null;

    const chat = await db.aiTutorChat.findFirst({
      where: { 
        id: chatId,
        studentProfileId: profile.id 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return chat;
  } catch (error) {
    console.error("GET_CHAT_HISTORY_ERROR:", error);
    return null;
  }
}

export async function createNewChat(language = 'english') {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    const newChat = await db.aiTutorChat.create({
      data: {
        studentProfileId: profile.id,
        language,
        title: "New Conversation"
      }
    });

    revalidatePath("/study/tutor");
    return { success: true, chat: newChat };
  } catch (error) {
    console.error("CREATE_NEW_CHAT_ERROR:", error);
    return { success: false, error: "Failed to create new chat" };
  }
}

export async function sendTutorMessage(chatId, content, language = 'english') {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const isPremium = session.user.role === 'premium_student' || session.user.role === 'super_admin';

    // 1. Check Usage Limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isPremium) {
      const usage = await db.aiUsage.findUnique({
        where: { userId_date: { userId, date: today } }
      });

      if (usage && usage.count >= FREE_USER_DAILY_LIMIT) {
        return { 
          success: false, 
          error: `Daily limit reached. Upgrade to Premium for more.` 
        };
      }
    }

    // 2. Get Chat Session
    const chat = await db.aiTutorChat.findUnique({
      where: { id: chatId },
      include: { messages: true }
    });

    if (!chat) return { success: false, error: "Chat not found" };

    // 3. Save User Message
    await db.aiTutorMessage.create({
      data: {
        chatId,
        role: 'student',
        content
      }
    });

    // 4. Prepare History for AI
    const history = chat.messages.map(m => ({
      role: m.role === 'student' ? 'user' : 'assistant',
      content: m.content
    }));
    history.push({ role: 'user', content });

    // 5. Get AI Response
    const aiResponse = await getGroqTutorResponse(history, language);

    // 6. Save AI Response
    await db.aiTutorMessage.create({
      data: {
        chatId,
        role: 'ai',
        content: aiResponse
      }
    });

    // 7. Update Usage
    await db.aiUsage.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, count: 1 },
      update: { count: { increment: 1 } }
    });

    // 8. Update Title if needed
    if (chat.title === "New Conversation" || !chat.title) {
      const newTitle = await generateChatTitle(content);
      await db.aiTutorChat.update({
        where: { id: chatId },
        data: { title: newTitle }
      });
    }

    revalidatePath("/study/tutor");
    return { success: true, response: aiResponse };

  } catch (error) {
    console.error("SEND_TUTOR_MESSAGE_ERROR:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function deleteChatSession(chatId) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    await db.aiTutorChat.delete({
      where: { 
        id: chatId,
        studentProfileId: profile.id
      }
    });

    revalidatePath("/study/tutor");
    return { success: true };
  } catch (error) {
    console.error("DELETE_CHAT_SESSION_ERROR:", error);
    return { success: false, error: "Failed to delete chat" };
  }
}
