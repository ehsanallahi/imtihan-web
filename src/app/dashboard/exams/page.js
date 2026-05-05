import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, Clock, ArrowRight, CheckCircle2, XCircle, BarChart2 } from "lucide-react";

export default async function DashboardExamsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const sessions = await db.examSession.findMany({
    where: { studentId: session.user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const subjectIds = [...new Set(sessions.map((s) => s.subjectId).filter(Boolean))];
  const subjects = await db.subject.findMany({ where: { id: { in: subjectIds } } });
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));

  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((a, s) => a + s.correctAnswers, 0);
  const totalQs = sessions.reduce((a, s) => a + s.totalQuestions, 0);
  const avgScore = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => Math.round((s.correctAnswers / s.totalQuestions) * 100))) : 0;

  const formatTime = (s) => {
    if (!s) return "--";
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900">My Exams</h1>
        <p className="text-zinc-500 mt-1">Review your past quizzes and mock exams</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: totalSessions, icon: GraduationCap, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Avg. Score", value: `${avgScore}%`, icon: BarChart2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Best Score", value: `${bestScore}%`, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Questions Answered", value: totalQs, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-zinc-500">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-teal-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exam List */}
      <div>
        <h2 className="text-xl font-display font-bold text-teal-900 mb-4">Exam History</h2>
        {sessions.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
            <GraduationCap className="w-12 h-12 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-1">No exams yet</h3>
            <p className="text-zinc-500 mb-6">Start a practice quiz or mock exam to see your results here.</p>
            <Link href="/study">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Go to Study Area</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {sessions.map((s, idx) => {
              const acc = Math.round((s.correctAnswers / s.totalQuestions) * 100);
              const color = acc >= 80 ? "text-emerald-600 bg-emerald-50" : acc >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
              return (
                <div key={s.id} className={`flex items-center gap-4 p-4 sm:p-5 ${idx !== 0 ? "border-t border-slate-100" : ""}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${color}`}>
                    {acc}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-teal-900 truncate">{subjectMap[s.subjectId] || "Practice Quiz"}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span>{s.correctAnswers}/{s.totalQuestions} correct</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(s.timeTakenSeconds)}</span>
                      <span className="capitalize">{s.sessionType.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 hidden sm:block">
                    {new Date(s.completedAt).toLocaleDateString("en-PK")}
                  </div>
                  <Link href={`/study/quiz/results/${s.id}`}>
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50">
                      Review <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
