import { NextResponse } from "next/server";
import { getGroqTutorResponse, generateChatTitle } from "@/lib/services/ai-service";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// Title generation moved to ai-service.js

export async function POST(req) {
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

    const userId = payload.id;
    const isPremium = payload.role === 'premium_student' || payload.role === 'super_admin';
    const FREE_USER_DAILY_LIMIT = 5;

    // 1. Check Usage Limits for free users
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isPremium) {
      const usage = await db.aiUsage.findUnique({
        where: { userId_date: { userId, date: today } }
      });

      if (usage && usage.count >= FREE_USER_DAILY_LIMIT) {
        return NextResponse.json(
          { error: `You've reached your daily limit of ${FREE_USER_DAILY_LIMIT} AI questions. Upgrade to Premium for unlimited access!` },
          { status: 429 } // Too Many Requests
        );
      }
    }

    const { messages, language = 'english', chatId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // 1. Find or create the student's chat thread
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    let chat;
    
    if (chatId) {
      chat = await db.aiTutorChat.findFirst({
        where: { 
          id: chatId,
          studentProfileId: studentProfile.id 
        }
      });
    }

    if (!chat) {
      chat = await db.aiTutorChat.findFirst({
        where: { studentProfileId: studentProfile.id },
        orderBy: { updatedAt: 'desc' }
      });
    }

    if (!chat) {
      chat = await db.aiTutorChat.create({
        data: {
          studentProfileId: studentProfile.id,
          language: language,
        }
      });
    } else if (chat.language !== language) {
       // Update language if changed
       await db.aiTutorChat.update({
         where: { id: chat.id },
         data: { language }
       });
    }

    // 2. Save the user's latest message if it's not already in history
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await db.aiTutorMessage.create({
        data: {
          chatId: chat.id,
          role: 'student',
          content: lastUserMessage.content,
        }
      });
    }

    // 3. Get AI Response
    const aiResponse = await getGroqTutorResponse(messages, language);

    // 4. Save AI Response
    await db.aiTutorMessage.create({
      data: {
        chatId: chat.id,
        role: 'ai',
        content: aiResponse,
      }
    });

    // 10. Update usage count for free users
    if (!isPremium) {
      await db.aiUsage.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, count: 1 },
        update: { count: { increment: 1 } }
      });
    }

    // 11. Generate Title if it's a new conversation
    try {
      if (chat.title === "New Conversation" || !chat.title) {
        const firstStudentMessage = messages.find(m => m.role === 'student' || m.role === 'user')?.content || messages[0].content;
        const newTitle = await generateChatTitle(firstStudentMessage);
        await db.aiTutorChat.update({
          where: { id: chat.id },
          data: { title: newTitle }
        });
      }
    } catch (titleError) {
      console.error("[AUTO_TITLE_ERROR]:", titleError);
      // Don't throw, just let the chat continue
    }

    return NextResponse.json({ 
      response: aiResponse,
      threadId: chat.id 
    });
  } catch (error) {
    console.error("[AI_TUTOR_ROUTE_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI chat" },
      { status: 500 }
    );
  }
}
