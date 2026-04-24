'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Starts a new exam session for practice.
 * @param {string} chapterId - The ID of the chapter to practice.
 * @returns {Promise<{success: boolean, sessionId?: string, error?: string}>}
 */
export async function startExamSession(chapterId, difficulty = "all", limit = null) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const where = { chapterId, isApproved: true };
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    const totalAvailable = await db.mCQ.count({ where });

    if (totalAvailable === 0) {
      return { success: false, error: "No MCQs available matching your criteria" };
    }

    const finalLimit = limit ? Math.min(limit, totalAvailable) : totalAvailable;

    const examSession = await db.examSession.create({
      data: {
        studentId: session.user.id,
        sessionType: "practice",
        subjectId: (await db.chapter.findUnique({ where: { id: chapterId }, select: { subjectId: true } }))?.subjectId,
        totalQuestions: finalLimit,
      }
    });

    return { success: true, sessionId: examSession.id };
  } catch (error) {
    console.error("Failed to start exam session:", error);
    return { success: false, error: "Failed to start practice session" };
  }
}

/**
 * Submits an exam session, calculating the final score and recording attempts.
 * @param {string} sessionId - The ID of the exam session.
 * @param {Array<{mcqId: string, selectedAnswer: string, timeTakenSeconds: number}>} answers - The answers submitted by the student.
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
export async function submitExam(sessionId, answers) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const examSession = await db.examSession.findUnique({
      where: { id: sessionId }
    });

    if (!examSession || examSession.studentId !== session.user.id) {
      return { success: false, error: "Session not found or unauthorized" };
    }

    // Fetch the actual MCQs to check answers
    const mcqIds = answers.map(a => a.mcqId);
    const mcqs = await db.mCQ.findMany({
      where: { id: { in: mcqIds } }
    });

    let correctAnswers = 0;
    let totalTimeTaken = 0;

    const attemptsData = answers.map(answer => {
      const mcq = mcqs.find(m => m.id === answer.mcqId);
      const isCorrect = mcq && mcq.correctAnswer === answer.selectedAnswer;
      
      if (isCorrect) correctAnswers++;
      if (answer.timeTakenSeconds) totalTimeTaken += answer.timeTakenSeconds;

      return {
        examSessionId: sessionId,
        mcqId: answer.mcqId,
        selectedAnswer: answer.selectedAnswer || "SKIP",
        isCorrect: isCorrect || false,
        timeTakenSeconds: answer.timeTakenSeconds || 0
      };
    });

    // Save attempts in a transaction
    await db.$transaction([
      db.mCQAttempt.createMany({
        data: attemptsData
      }),
      db.examSession.update({
        where: { id: sessionId },
        data: {
          correctAnswers: correctAnswers,
          timeTakenSeconds: totalTimeTaken,
          completedAt: new Date()
        }
      })
    ]);

    return { success: true, score: correctAnswers };
  } catch (error) {
    console.error("Failed to submit exam:", error);
    return { success: false, error: "Failed to submit exam" };
  }
}

/**
 * Starts a new mock exam session spanning the entire subject.
 * @param {string} subjectId - The ID of the subject.
 * @returns {Promise<{success: boolean, sessionId?: string, error?: string}>}
 */
export async function startMockExamSession(subjectId) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // A full mock exam might take 30 random questions from the subject
    const mcqsCount = await db.mCQ.count({
      where: { subjectId: subjectId, isApproved: true }
    });

    if (mcqsCount === 0) {
      return { success: false, error: "No MCQs available for this subject" };
    }

    // Determine how many questions to serve (max 30 for now)
    const totalQuestions = Math.min(mcqsCount, 30);

    const examSession = await db.examSession.create({
      data: {
        studentId: session.user.id,
        sessionType: "mock_exam",
        subjectId: subjectId,
        totalQuestions: totalQuestions,
      }
    });

    return { success: true, sessionId: examSession.id };
  } catch (error) {
    console.error("Failed to start mock exam session:", error);
    return { success: false, error: "Failed to start mock exam session" };
  }
}
