import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BrainCircuit, PlayCircle, BookOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { startExamSession } from "@/actions/quizActions";
import { checkUserSubscription } from "@/actions/subscriptionActions";
import { Lock } from "lucide-react";

export default async function ChapterStudyPage({ params }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      _count: {
        select: { mcqs: true }
      },
      textbookUploads: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!chapter) {
    notFound();
  }

  const upload = chapter.textbookUploads[0];
  const aiExplanation = upload?.aiExplanation;
  const hasMcqs = chapter._count.mcqs > 0;

  // Subscription Gating
  const sub = await checkUserSubscription();
  const isPremium = sub.isPremium;
  const isLocked = chapter.number > 1 && !isPremium;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-8">
        <Link href={`/study/subject/${chapter.subjectId}`} className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {chapter.subject.name}
        </Link>
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 mb-3">
              Chapter {chapter.number}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-teal-950">
              {chapter.name}
            </h1>
            {chapter.nameUrdu && (
              <p className="text-lg sm:text-xl text-zinc-600 font-urdu mt-1" dir="rtl">
                {chapter.nameUrdu}
              </p>
            )}
          </div>

          {hasMcqs && !isLocked && (
            <form action={async () => {
              "use server";
              const result = await startExamSession(chapterId);
              if (result.success) {
                redirect(`/study/quiz/${result.sessionId}?chapterId=${chapterId}`);
              }
            }}>
              <Button type="submit" size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md rounded-full px-8">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Practice Quiz ({chapter._count.mcqs} Qs)
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {isLocked ? (
          <div className="p-12 text-center border-2 border-[#1899D6] rounded-[2rem] bg-[#1CB0F6]/5 shadow-[0_8px_0_0_rgba(28,176,246,0.1)]">
            <div className="w-20 h-20 bg-[#1CB0F6] rounded-full mx-auto flex items-center justify-center mb-6 shadow-md">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-display font-extrabold text-[#3C3C3C] mb-4">Premium Content Locked</h3>
            <p className="text-[#777777] font-medium text-lg mb-8 max-w-md mx-auto">
              Upgrade to Imtihan Super to unlock Chapter {chapter.number} and get unlimited access to all notes, quizzes, and mock exams.
            </p>
            <Link href="/pricing">
              <Button className="h-14 px-8 rounded-2xl font-black text-lg uppercase tracking-wider bg-[#FFD900] hover:bg-[#F2CE00] text-[#D9A300] border-b-[6px] border-[#E5C300] active:border-b-[2px] active:translate-y-[4px] transition-all">
                Unlock with Super
              </Button>
            </Link>
          </div>
        ) : !aiExplanation ? (
          <div className="p-12 text-center border-2 border-dashed border-teal-100 rounded-xl bg-teal-50/30">
            <BookOpen className="w-12 h-12 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-teal-900 mb-1">No study notes available</h3>
            <p className="text-zinc-500">The AI explanation for this chapter has not been generated yet.</p>
          </div>
        ) : (
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400" />
            <CardContent className="p-4 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-teal-950">AI Study Notes</h2>
                  <p className="text-sm text-zinc-500">Read through these notes before taking the quiz.</p>
                </div>
              </div>
              
              <div className="prose prose-teal prose-headings:font-display prose-headings:text-teal-900 prose-p:text-zinc-600 prose-a:text-teal-600 hover:prose-a:text-teal-700 max-w-none prose-lg">
                <ReactMarkdown>{aiExplanation}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
