import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { QuizInteractive } from "@/components/study/QuizInteractive";

export default async function QuizPage({ params, searchParams }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { sessionId } = await params;
  const { chapterId, difficulty, limit } = await searchParams;

  const examSession = await db.examSession.findUnique({
    where: { id: sessionId }
  });

  if (!examSession || examSession.studentId !== session.user.id || examSession.completedAt) {
    redirect("/study");
  }

  // Ensure chapterId exists if it's a practice session
  if (examSession.sessionType === "practice" && !chapterId) {
    redirect("/study");
  }

  let mcqs = [];

  const baseWhere = { isApproved: true };
  if (examSession.sessionType === "practice") {
    baseWhere.chapterId = chapterId;
    if (difficulty && difficulty !== "all") {
      baseWhere.difficulty = difficulty;
    }
  } else {
    baseWhere.subjectId = examSession.subjectId;
  }

  const allPossibleMcqs = await db.mCQ.findMany({
    where: baseWhere,
    select: {
      id: true, question: true, questionUrdu: true,
      optionA: true, optionB: true, optionC: true, optionD: true
    }
  });

  // Shuffle array (Fisher-Yates)
  for (let i = allPossibleMcqs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPossibleMcqs[i], allPossibleMcqs[j]] = [allPossibleMcqs[j], allPossibleMcqs[i]];
  }

  const finalLimit = limit ? parseInt(limit) : examSession.totalQuestions;
  mcqs = allPossibleMcqs.slice(0, finalLimit);

  if (mcqs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-teal-900 mb-2">No Questions Available</h2>
        <p className="text-zinc-600 mb-6">There are no approved practice questions for this chapter yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <QuizInteractive sessionId={sessionId} mcqs={mcqs} />
    </div>
  );
}
