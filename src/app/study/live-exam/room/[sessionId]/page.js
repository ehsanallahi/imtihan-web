import React from 'react';
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import LiveExamPlayer from "@/components/study/LiveExamPlayer";

export default async function LiveExamRoomPage({ params }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { sessionId } = params;

  // Fetch the session and the associated live exam and MCQs
  const examSession = await db.examSession.findUnique({
    where: { id: sessionId },
    include: {
      liveExam: {
        include: {
          subject: {
            include: {
              chapters: {
                include: {
                  mcqs: {
                    take: 50 // Limit for competition
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!examSession || !examSession.liveExam) notFound();
  if (examSession.completedAt) redirect(`/study/analytics/${sessionId}`);

  // Flatten MCQs from all chapters of the subject
  const allMcqs = examSession.liveExam.subject.chapters.flatMap(chapter => chapter.mcqs);
  
  // Shuffle and pick the required number of questions
  const shuffledMcqs = allMcqs.sort(() => 0.5 - Math.random()).slice(0, examSession.totalQuestions);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <LiveExamPlayer 
        session={examSession} 
        questions={shuffledMcqs} 
      />
    </div>
  );
}
