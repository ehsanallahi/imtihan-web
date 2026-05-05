import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, BrainCircuit, CheckCircle2, Trophy, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GuardianDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const guardianProfile = await db.guardianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              user: true,
              achievements: {
                include: { achievement: true },
                orderBy: { unlockedAt: 'desc' },
                take: 3
              }
            }
          }
        }
      }
    }
  });

  if (!guardianProfile && session.user.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-display font-bold text-teal-900 mb-2">Guardian Profile Not Found</h1>
        <p className="text-zinc-500 mb-6">If you are a parent, please contact support to link your account to your children.</p>
      </div>
    );
  }

  // For Super Admins or Mock data if no students linked yet
  const students = guardianProfile?.students || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
          Children's Progress
        </h1>
        <p className="text-zinc-500">
          Monitor your children's study habits and exam performance.
        </p>
      </div>

      {students.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-teal-900">No Students Linked</h3>
            <p className="text-sm text-zinc-500 mt-1">You haven't linked any student accounts to your guardian profile yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {students.map(({ student }) => (
            <StudentProgressCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

async function StudentProgressCard({ student }) {
  // Fetch stats for this student
  const examSessions = await db.examSession.findMany({
    where: { studentId: student.userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5
  });

  const totalQs = student.totalMcqsAttempted;
  const totalCorrect = await db.mCQAttempt.count({
    where: { 
      examSession: { studentId: student.userId },
      isCorrect: true 
    }
  });
  
  const avgScore = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="bg-teal-50/50 border-b border-teal-50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
              {student.user.name?.[0] || "S"}
            </div>
            <div>
              <CardTitle className="text-xl font-display font-bold text-teal-900">
                {student.user.name}
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="bg-white text-teal-700 capitalize text-[10px]">{student.grade} Grade</Badge>
                <Badge variant="secondary" className="bg-white text-teal-700 capitalize text-[10px]">{student.board} Board</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-1 text-orange-600 justify-center">
                <Flame className="w-4 h-4 fill-current" />
                <span className="text-lg font-bold">{student.studyStreak}</span>
              </div>
              <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="text-indigo-600 text-lg font-bold justify-center">
                {avgScore}%
              </div>
              <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Avg. Score</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side: Stats & Badges */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Academic Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <BrainCircuit className="w-5 h-5 text-teal-600 mb-2" />
                  <div className="text-xl font-bold text-teal-950">{totalQs}</div>
                  <p className="text-xs text-zinc-500">MCQs Attempted</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
                  <div className="text-xl font-bold text-teal-950">{totalCorrect}</div>
                  <p className="text-xs text-zinc-500">Correct Answers</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Recent Achievements</h4>
              <div className="flex gap-3">
                {student.achievements.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">No badges earned yet.</p>
                ) : (
                  student.achievements.map((record) => (
                    <div key={record.id} className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center gap-2" title={record.achievement.description}>
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-indigo-900">{record.achievement.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Recent Activity */}
          <div>
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Recent Exam Activity</h4>
            <div className="space-y-3">
              {examSessions.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No exams completed yet.</p>
              ) : (
                examSessions.map((s) => {
                  const acc = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${acc >= 80 ? "bg-emerald-100 text-emerald-700" : acc >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {acc}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">Quiz Session</p>
                        <p className="text-xs text-zinc-400">{s.correctAnswers}/{s.totalQuestions} correct · {new Date(s.completedAt).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/dashboard/exams`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white text-zinc-400 hover:text-teal-600">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
