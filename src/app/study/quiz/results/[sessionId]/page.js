import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, XCircle, Award, Clock, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default async function QuizResultsPage({ params }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { sessionId } = await params;

  const examSession = await db.examSession.findUnique({
    where: { id: sessionId },
    include: {
      results: {
        include: {
          mcq: true
        }
      }
    }
  });

  let subject = null;
  if (examSession?.subjectId) {
    subject = await db.subject.findUnique({
      where: { id: examSession.subjectId }
    });
  }

  if (!examSession || examSession.studentId !== session.user.id) {
    notFound();
  }

  if (!examSession.completedAt) {
    // Session is not completed, redirect back to quiz
    // Note: We need chapterId to redirect to quiz, we might need to find it from the first result
    const chapterId = examSession.results[0]?.mcq.chapterId;
    if (chapterId) {
      redirect(`/study/quiz/${sessionId}?chapterId=${chapterId}`);
    } else {
      redirect("/study");
    }
  }

  const scorePercentage = Math.round((examSession.correctAnswers / examSession.totalQuestions) * 100);
  
  // Format time (MM:SS)
  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/study/subject/${examSession.subjectId}`} className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {subject?.name || 'Subject'}
        </Link>
        <Link href="/study">
          <Button variant="outline" size="sm" className="text-teal-700 border-teal-200 hover:bg-teal-50">
            Study Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Results Summary Scorecard */}
      <Card className="border-none shadow-md overflow-hidden bg-white mb-10">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-500 p-8 text-white text-center">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
            Quiz Completed!
          </h1>
          <p className="text-teal-100 text-lg">
            Here is how you performed.
          </p>
        </div>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
            <div>
              <div className="text-4xl font-bold text-teal-900 mb-1">{scorePercentage}%</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-900 mb-1">
                <span className={examSession.correctAnswers === examSession.totalQuestions ? "text-emerald-500" : ""}>
                  {examSession.correctAnswers}
                </span>
                <span className="text-2xl text-zinc-300">/{examSession.totalQuestions}</span>
              </div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-900 mb-1 flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 text-teal-300" />
                {formatTime(examSession.timeTakenSeconds)}
              </div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Time Taken</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <h2 className="text-2xl font-display font-bold text-teal-900 mb-6">Detailed Review</h2>
      
      <div className="space-y-6">
        {examSession.results.map((attempt, index) => {
          const { mcq, isCorrect, selectedAnswer } = attempt;
          
          return (
            <Card key={attempt.id} className={`border-l-4 shadow-sm ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-start mb-4">
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-500">Question {index + 1}</span>
                    </div>
                    <p className="text-lg font-medium text-slate-900">{mcq.question}</p>
                    {mcq.questionUrdu && (
                      <p className="text-lg font-urdu text-zinc-600 text-right leading-loose mt-2" dir="rtl">
                        {mcq.questionUrdu}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 mb-6 ml-12">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const isSelected = selectedAnswer === opt;
                    const isActualCorrect = mcq.correctAnswer === opt;
                    const optionText = mcq[`option${opt}`];
                    
                    if (!optionText) return null;

                    let bgClass = "bg-slate-50 border-slate-100 text-slate-600";
                    if (isActualCorrect) {
                      bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium";
                    } else if (isSelected && !isCorrect) {
                      bgClass = "bg-rose-50 border-rose-200 text-rose-800";
                    }

                    return (
                      <div key={opt} className={`flex items-center p-3 rounded-lg border ${bgClass}`}>
                        <span className={`w-6 text-sm font-bold ${isActualCorrect ? 'text-emerald-600' : isSelected ? 'text-rose-600' : 'text-slate-400'}`}>
                          {opt}.
                        </span>
                        <span className="flex-1">{optionText}</span>
                        {isSelected && <span className="text-xs font-semibold ml-2 uppercase tracking-wide opacity-60">Your Answer</span>}
                        {isActualCorrect && <span className="text-xs font-semibold ml-2 uppercase tracking-wide opacity-60">Correct Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {mcq.explanation && (
                  <div className="ml-12 bg-indigo-50/50 border border-indigo-100 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500" /> AI Explanation
                    </h4>
                    <div className="text-sm text-indigo-800/80 prose prose-sm max-w-none prose-indigo">
                      <ReactMarkdown>{mcq.explanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
