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

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const chat = await db.aiTutorChat.findFirst({
      where: { studentProfileId: studentProfile.id },
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
