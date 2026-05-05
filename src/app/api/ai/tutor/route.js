import { NextResponse } from "next/server";
import { getGroqTutorResponse } from "@/lib/services/ai-service";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

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

    const { messages, language = 'english' } = await req.json();

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

    let chat = await db.aiTutorChat.findFirst({
      where: { studentProfileId: studentProfile.id },
      orderBy: { updatedAt: 'desc' }
    });

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

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error("[AI_TUTOR_ROUTE_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI chat" },
      { status: 500 }
    );
  }
}
