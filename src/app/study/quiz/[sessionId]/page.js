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
  const { chapterId } = await searchParams;

  if (!chapterId) {
    redirect("/study");
  }

  const examSession = await db.examSession.findUnique({
    where: { id: sessionId }
  });

  if (!examSession || examSession.studentId !== session.user.id || examSession.completedAt) {
    // If session doesn't exist, belongs to someone else, or is already completed, redirect.
    redirect("/study");
  }

  // Fetch approved MCQs for this chapter
  const mcqs = await db.mCQ.findMany({
    where: { 
      chapterId: chapterId,
      isApproved: true
    },
    select: {
      id: true,
      question: true,
      questionUrdu: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      // Intentionally omitting 'correctAnswer' and 'explanation' 
      // so they are not sent to the client during the quiz.
    }
  });

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
