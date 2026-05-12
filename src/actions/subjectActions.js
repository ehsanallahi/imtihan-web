'use server'

import { db } from "@/lib/db";

export async function getSubjectsByGradeAndBoard(grade, board) {
  try {
    if (!grade || !board) return [];
    const subjects = await db.subject.findMany({
      where: {
        grade,
        board,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        nameUrdu: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subjects;
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return [];
  }
}
