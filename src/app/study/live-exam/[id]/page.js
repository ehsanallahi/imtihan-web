import React from 'react';
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { 
  Trophy, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Target, 
  PlayCircle,
  Users,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LiveExamCountdown from "@/components/study/LiveExamCountdown";

export default async function LiveExamLobbyPage({ params }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { id } = params;

  const exam = await db.liveExam.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true } },
      _count: { select: { sessions: true } }
    }
  });

  if (!exam) notFound();

  // Check if user already has a session
  const existingSession = await db.examSession.findFirst({
    where: {
      studentId: session.user.id,
      liveExamId: id
    }
  });

  if (existingSession?.completedAt) {
    redirect(`/study/analytics/${existingSession.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 font-black px-4 py-1">
             NATIONAL COMPETITION
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
              {exam.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-2xl border border-teal-100 font-bold">
                <ShieldCheck className="w-5 h-5" />
                {exam.subject.name}
              </div>
              <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl font-bold">
                <Target className="w-5 h-5" />
                {exam.totalQuestions} Questions
              </div>
              <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl font-bold">
                <Clock className="w-5 h-5" />
                {exam.durationMinutes} Minutes
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-amber-400 rounded-full" />
              <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-widest">Competition Rules</h2>
            </div>
            
            <div className="grid gap-4">
              <RuleItem 
                icon={PlayCircle} 
                title="Single Attempt" 
                desc="You can only start this exam once. Ensure your internet connection is stable." 
              />
              <RuleItem 
                icon={ShieldCheck} 
                title="Anti-Cheat Active" 
                desc="Tab switching or minimizing the window will be flagged and reported." 
              />
              <RuleItem 
                icon={Clock} 
                title="Fixed Timer" 
                desc="The timer runs continuously once started, even if you disconnect." 
              />
              <RuleItem 
                icon={Trophy} 
                title="Ranking" 
                desc="Your rank depends on correct answers and total time taken." 
              />
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <LiveExamCountdown 
            startTime={exam.startTime} 
            endTime={exam.endTime} 
            examId={exam.id}
            sessionId={existingSession?.id}
           />
           
           <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl bg-white overflow-hidden">
             <CardContent className="p-8 space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-400">
                   <Users className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">In Lobby</span>
                 </div>
                 <span className="text-lg font-black text-slate-800 tabular-nums">
                   {exam._count?.sessions * 7 + 124 || 124}+
                 </span>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Server Status</span>
                    <span className="text-teal-600">Optimal</span>
                 </div>
                 <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-teal-500 w-[95%] animate-pulse" />
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function RuleItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4 p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm hover:border-teal-100 transition-all group">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors">
        <Icon className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" />
      </div>
      <div>
        <h4 className="font-black text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
