import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const whereClause = { studentProfileId: studentProfile.id };
    if (chatId) {
      whereClause.id = chatId;
    }

    const chat = await db.aiTutorChat.findFirst({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!chat) {
      return NextResponse.json({ messages: [], language: 'english' });
    }

    const formattedMessages = chat.messages.map(m => ({
      role: m.role === 'student' ? 'user' : 'assistant',
      content: m.content
    }));

    return NextResponse.json({ 
      messages: formattedMessages,
      language: chat.language
    });
  } catch (error) {
    console.error("[AI_TUTOR_HISTORY_ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req) {
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

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    // If a chatId is provided, delete only that specific chat
    if (chatId) {
      await db.aiTutorChat.deleteMany({
        where: { 
          id: chatId,
          studentProfileId: studentProfile.id 
        }
      });
      return NextResponse.json({ message: "Chat session deleted successfully" });
    }

    // Otherwise, delete all history for this student
    await db.aiTutorChat.deleteMany({
      where: { studentProfileId: studentProfile.id }
    });

    return NextResponse.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("[AI_TUTOR_CLEAR_ERROR]:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
