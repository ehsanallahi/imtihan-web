import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const papers = await db.pastPaper.findMany({
      include: {
        subject: {
          select: { name: true }
        }
      },
      orderBy: { year: 'desc' }
    });

    const formattedPapers = papers.map(p => ({
      id: p.id,
      title: p.title,
      board: p.board,
      year: p.year,
      grade: p.grade,
      subject: p.subject.name,
    }));

    return NextResponse.json(formattedPapers);
  } catch (error) {
    console.error("[PAST_PAPERS_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch past papers" },
      { status: 500 }
    );
  }
}
