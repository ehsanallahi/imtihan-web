import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    // Optional: Filter by user's grade/board if token is present
    const authHeader = req.headers.get("authorization");
    let userProfile = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = await verifyToken(token);
      if (payload) {
        userProfile = await db.studentProfile.findUnique({
          where: { userId: payload.id },
        });
      }
    }

    const subjects = await db.subject.findMany({
      where: {
        isActive: true,
        // If user has a profile, we could filter by grade/board here
        // For now, return all to keep it simple as the app handles filtering/selection
      },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          include: {
            _count: {
              select: { mcqs: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("[SUBJECTS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
