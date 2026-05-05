import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // 1. Get the past paper metadata
    const paper = await db.pastPaper.findUnique({
      where: { id },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    // 2. Fetch MCQs that match this paper's metadata
    const mcqs = await db.pastPaperMCQ.findMany({
      where: {
        subjectId: paper.subjectId,
        year: paper.year,
        board: paper.board,
        grade: paper.grade,
        isApproved: true,
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(mcqs);
  } catch (error) {
    console.error("[PAST_PAPER_MCQS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch paper MCQs" },
      { status: 500 }
    );
  }
}
