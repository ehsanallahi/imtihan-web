import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/auth";

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

    const sessions = await db.aiTutorChat.findMany({
      where: { studentProfileId: studentProfile.id },
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

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[AI_TUTOR_SESSIONS_ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

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

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { language = 'english' } = await req.json();

    const newSession = await db.aiTutorChat.create({
      data: {
        studentProfileId: studentProfile.id,
        language: language,
        title: "New Conversation"
      }
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error("[AI_TUTOR_NEW_SESSION_ERROR]:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
