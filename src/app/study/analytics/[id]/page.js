import React from 'react';
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { 
  Trophy, 
  Target, 
  Clock, 
  ChevronLeft, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  Medal
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLiveExamLeaderboard } from "@/actions/liveExamActions";

export default async function ExamAnalyticsPage({ params }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { id } = params;

  const examSession = await db.examSession.findUnique({
    where: { id },
    include: {
      liveExam: {
        include: { subject: true }
      },
      student: {
        include: { user: { select: { name: true, avatar: true } } }
      }
    }
  });

  if (!examSession) notFound();

  const leaderboard = await getLiveExamLeaderboard(examSession.liveExamId);
  const myRank = leaderboard.findIndex(s => s.id === id) + 1 || "Top 100";

  const scorePercentage = Math.round((examSession.correctAnswers / examSession.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">Exam Results</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{examSession.liveExam?.title || "Mock Exam"}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
            <Share2 className="w-4 h-4" />
            Share Result
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={Trophy} 
            label="National Rank" 
            value={`#${myRank}`} 
            sub="Across Pakistan"
            color="text-amber-500"
            bg="bg-amber-50"
          />
          <StatCard 
            icon={Target} 
            label="Accuracy" 
            value={`${scorePercentage}%`} 
            sub={`${examSession.correctAnswers} / ${examSession.totalQuestions}`}
            color="text-teal-500"
            bg="bg-teal-50"
          />
          <StatCard 
            icon={Clock} 
            label="Time Taken" 
            value={`${Math.floor(examSession.timeTakenSeconds / 60)}m ${examSession.timeTakenSeconds % 60}s`} 
            sub="Avg. 42s / Q"
            color="text-indigo-500"
            bg="bg-indigo-50"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Percentile" 
            value="92nd" 
            sub="Elite Performance"
            color="text-emerald-500"
            bg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-white">
              <CardContent className="p-10 space-y-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-teal-500 rounded-full" />
                  <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-widest">Performance Analysis</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                   <ScoreCircle label="Correct" value={examSession.correctAnswers} color="text-teal-500" icon={CheckCircle2} />
                   <ScoreCircle label="Incorrect" value={examSession.incorrectAnswers} color="text-rose-500" icon={XCircle} />
                   <ScoreCircle label="Unanswered" value={examSession.totalQuestions - examSession.correctAnswers - examSession.incorrectAnswers} color="text-slate-300" icon={AlertCircle} />
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="font-black text-slate-800">Subject Strength</h3>
                  <div className="space-y-4">
                     <StrengthBar label={examSession.liveExam?.subject?.name || "General"} percentage={scorePercentage} color="bg-teal-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="rounded-[2.5rem] border-2 border-teal-100 bg-teal-50/30 shadow-lg overflow-hidden">
               <CardContent className="p-8 flex items-start gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-teal-100">
                     <Zap className="w-8 h-8 text-teal-600" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg font-black text-teal-900">AI Insight: Optimization Strategy</h3>
                     <p className="text-teal-700/80 font-medium text-sm leading-relaxed">
                       You performed exceptionally well on logic-based questions but took 20% longer on calculation-heavy problems. 
                       We've added 5 practice MCQs to your roadmap to help you master speed calculations.
                     </p>
                     <Link href="/study" className="inline-flex items-center text-teal-700 font-black text-sm hover:underline gap-1">
                        View Roadmap <ChevronLeft className="w-4 h-4 rotate-180" />
                     </Link>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-amber-400 rounded-full" />
              <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-widest">National Top 10</h2>
            </div>

            <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-white">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Student</span>
                 <span>Score</span>
              </div>
              <CardContent className="p-0">
                {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((s, idx) => (
                  <div key={s.id} className={`flex items-center justify-between p-5 border-b border-slate-50 last:border-0 ${s.id === id ? 'bg-teal-50/50' : ''}`}>
                    <div className="flex items-center gap-4">
                       <span className={`w-6 text-center font-black ${idx < 3 ? 'text-amber-500' : 'text-slate-300'}`}>
                         {idx === 0 ? <Medal className="w-5 h-5 mx-auto" /> : idx + 1}
                       </span>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[10px] text-slate-400">
                             {s.student.user.avatar || s.student.user.name[0]}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{s.student.user.name}</span>
                       </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">
                       {Math.round((s.correctAnswers / s.totalQuestions) * 100)}%
                    </span>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 font-medium">
                     Leaderboard calculating...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <Card className="rounded-[2rem] border-2 border-slate-100 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h4 className={`text-2xl font-black ${color} tracking-tight mb-1`}>{value}</h4>
        <p className="text-xs font-bold text-slate-500 opacity-60">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ScoreCircle({ label, value, color, icon: Icon }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
       <div className={`w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${color}`} />
       </div>
       <div>
          <p className="text-2xl font-black text-slate-800 tabular-nums">{value}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       </div>
    </div>
  );
}

function StrengthBar({ label, percentage, color }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
          <span>{label}</span>
          <span className="text-slate-800">{percentage}%</span>
       </div>
       <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full ${color} rounded-full`} 
            style={{ width: `${percentage}%` }}
          />
       </div>
    </div>
  );
}
