import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, CheckCircle2, ChevronLeft, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { checkUserSubscription } from "@/actions/subscriptionActions";
import { startMockExamSession } from "@/actions/quizActions";

export default async function SubjectPage({ params }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { subjectId } = await params;

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        orderBy: { number: 'asc' },
        include: {
          _count: {
            select: { mcqs: true }
          },
          textbookUploads: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              mcqsGenerated: true,
              explanationGenerated: true
            }
          }
        }
      }
    }
  });

  if (!subject) {
    notFound();
  }

  // Check Subscription for Mock Exam access
  const sub = await checkUserSubscription();
  const isPremium = sub.isPremium;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-8">
        <Link href="/study" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Subjects
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold tracking-tight text-teal-950 sm:text-4xl">
              {subject.name}
            </h1>
            {subject.nameUrdu && (
              <p className="text-xl text-zinc-600 font-urdu" dir="rtl">
                {subject.nameUrdu}
              </p>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-2xl border-2 border-[#E5E5E5] shadow-sm flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-[#3C3C3C]">Ready for a challenge?</h3>
              <p className="text-sm text-[#777777] font-medium">30 random questions across all chapters.</p>
            </div>
            {isPremium ? (
              <form action={async () => {
                "use server";
                const result = await startMockExamSession(subject.id);
                if (result.success) {
                  redirect(`/study/quiz/${result.sessionId}`);
                }
              }}>
                <Button type="submit" className="h-10 px-6 rounded-xl font-bold uppercase tracking-wide bg-[#FF9600] hover:bg-[#E58700] text-white border-b-4 border-[#D98000] active:border-b-0 active:translate-y-1 transition-all">
                  Take Mock Exam
                </Button>
              </form>
            ) : (
              <Link href="/pricing">
                <Button className="h-10 px-6 rounded-xl font-bold uppercase tracking-wide bg-[#FFD900] hover:bg-[#F2CE00] text-[#D9A300] border-b-4 border-[#E5C300] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Unlock Mock Exams
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-teal-900 flex items-center gap-2">
          <LayersIcon className="h-6 w-6 text-teal-600" />
          Chapters
        </h2>

        {subject.chapters.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-teal-100 rounded-xl bg-teal-50/30">
            <h3 className="text-lg font-medium text-teal-900 mb-1">No chapters yet</h3>
            <p className="text-zinc-500">Content for this subject is still being prepared.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subject.chapters.map((chapter) => {
              const upload = chapter.textbookUploads[0];
              const hasExplanation = upload?.explanationGenerated;
              const hasMcqs = chapter._count.mcqs > 0;
              const isReady = hasExplanation || hasMcqs;

              return (
                <Card key={chapter.id} className={`group overflow-hidden flex flex-col transition-all duration-300 ${isReady ? 'hover:shadow-md border-teal-100/50 hover:border-teal-300' : 'opacity-70 grayscale-[0.5]'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600">
                        Chapter {chapter.number}
                      </Badge>
                      <div className="flex gap-1">
                        {hasExplanation && (
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-1.5" title="Theory Available">
                            <BookOpen className="h-3 w-3" />
                          </Badge>
                        )}
                        {hasMcqs && (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-1.5" title="MCQs Available">
                            <BrainCircuit className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className={`text-lg font-bold ${isReady ? 'text-teal-950' : 'text-zinc-500'}`}>
                      {chapter.name}
                    </CardTitle>
                    {chapter.nameUrdu && (
                      <CardDescription className="text-sm font-urdu text-right" dir="rtl">
                        {chapter.nameUrdu}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-sm text-zinc-500 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {chapter._count.mcqs} Practice Questions
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/50">
                    <Link href={`/study/chapter/${chapter.id}`} className="w-full" aria-disabled={!isReady} tabIndex={!isReady ? -1 : 0}>
                      <Button 
                        disabled={!isReady} 
                        className={`w-full ${isReady ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}
                      >
                        {isReady ? "Study Chapter" : "Coming Soon"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function LayersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
