import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const mcqs = await db.mCQ.findMany({
      where: {
        chapterId: id,
        isApproved: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(mcqs);
  } catch (error) {
    console.error("[CHAPTER_MCQS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch MCQs" },
      { status: 500 }
    );
  }
}
