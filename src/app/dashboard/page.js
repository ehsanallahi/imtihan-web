import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Clock, CheckCircle2, BrainCircuit,
  FileText, ArrowRight, BookOpen, Flame, Users, AlertCircle
} from "lucide-react";
import { DashboardUploadSyllabus } from "@/components/dashboard/DashboardActions";
import { LeaderboardWidget, BadgesWidget, DailyReviewWidget, DailyGoalWidget } from "@/components/dashboard/GamificationWidgets";

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session) redirect("/auth/signin");

  const userRole = session?.user?.role;
  const adminRoles = [
    "super_admin", "moderator", "marketer", "content_editor", 
    "finance_manager", "support_agent", "institution_admin", "admin"
  ];
  const isAdmin = adminRoles.includes(userRole);

  const studentId = searchParams?.studentId;

  try {
    const targetUserId = (isAdmin && studentId) ? studentId : session.user.id;
    const isImpersonating = isAdmin && !!studentId && studentId !== session.user.id;

    // Fetch essential data in parallel for speed
    const [targetUser, examSessions, profile] = await Promise.all([
      db.user.findUnique({
        where: { id: targetUserId },
        select: { name: true, role: true }
      }),
      db.examSession.findMany({
        where: { studentId: targetUserId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 10
      }),
      db.studentProfile.findUnique({ where: { userId: targetUserId } })
    ]);

    const isCmsUser = ["super_admin", "content_editor", "moderator"].includes(userRole);
    
    const totalQs = examSessions.reduce((a, s) => a + s.totalQuestions, 0);
    const totalCorrect = examSessions.reduce((a, s) => a + s.correctAnswers, 0);
    const avgScore = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
    const streak = profile?.studyStreak || 0;

    const subjectIds = [...new Set(examSessions.map((s) => s.subjectId).filter(Boolean))];
    const subjects = await db.subject.findMany({ where: { id: { in: subjectIds } } });
    const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));

    const stats = [
      { title: "Total Exams", value: examSessions.length, icon: FileText, color: "text-teal-600", bg: "bg-teal-50", href: "/dashboard/exams" },
      { title: "Average Score", value: `${avgScore}%`, icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50", href: "/dashboard/exams" },
      { title: "Day Streak", value: streak, icon: Flame, color: "text-orange-500", bg: "bg-orange-50", href: "/study/analytics" },
      { title: "Questions Answered", value: totalQs, icon: BrainCircuit, color: "text-emerald-600", bg: "bg-emerald-50", href: "/study/analytics" },
    ];

    const formatTime = (s) => {
      if (!s) return "--";
      const m = Math.floor(s / 60);
      return m > 0 ? `${m}m` : `${s}s`;
    };

    const recentSessions = examSessions.slice(0, 4);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {isImpersonating && (
          <div className="bg-teal-50 border border-teal-100 text-teal-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3 font-bold">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white">
                 <Users className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-sm">Administrative View</p>
                 <p className="text-xs opacity-70 font-medium tracking-tight">Viewing dashboard for student: {targetUser?.name}</p>
              </div>
            </div>
            <Link href={`/admin/students/${studentId}`}>
              <Button variant="outline" size="sm" className="bg-white border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl font-bold px-6">
                Back to Admin Profile
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="text-zinc-500">
            Welcome back, {targetUser?.name || "Student"}. Track your progress and manage your exams.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-zinc-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-teal-900">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
          {/* Recent Activity */}
          <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-display font-bold text-teal-900">Recent Activity</CardTitle>
              {recentSessions.length > 0 && (
                <Link href="/dashboard/exams">
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50 text-xs">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl">
                  <div className="text-center space-y-2">
                    <p className="text-zinc-400 text-sm font-medium">No recent activity found.</p>
                    <DashboardUploadSyllabus isCmsUser={isCmsUser} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((s) => {
                    const acc = Math.round((s.correctAnswers / (s.totalQuestions || 1)) * 100);
                    return (
                      <Link key={s.id} href={`/study/quiz/results/${s.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-teal-50/50 transition-colors group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${acc >= 80 ? "bg-emerald-100 text-emerald-700" : acc >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                          {acc}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 truncate">{subjectMap[s.subjectId] || "Practice Quiz"}</p>
                          <p className="text-xs text-zinc-400">{s.correctAnswers}/{s.totalQuestions} correct · {formatTime(s.timeTakenSeconds)} · {new Date(s.completedAt).toLocaleDateString("en-PK")}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-3 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold text-teal-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/study" className="block">
                <div className="p-4 rounded-xl bg-teal-600 text-white space-y-1 hover:bg-teal-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Study Subjects</p>
                    <BookOpen className="w-4 h-4 opacity-80" />
                  </div>
                  <p className="text-xs text-teal-100">Browse chapters and practice MCQs</p>
                </div>
              </Link>
              <Link href="/study/analytics" className="block">
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-900 space-y-1 hover:bg-indigo-100 transition-colors border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">View Analytics</p>
                    <GraduationCap className="w-4 h-4 opacity-80" />
                  </div>
                  <p className="text-xs text-indigo-600">Accuracy & subject breakdown</p>
                </div>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <div className="p-4 rounded-xl bg-slate-50 text-zinc-700 space-y-1 hover:bg-slate-100 transition-colors border border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Complete Profile</p>
                    <Clock className="w-4 h-4 opacity-60" />
                  </div>
                  <p className="text-xs text-zinc-400">Set your grade & board for better results</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Section */}
        {profile?.id && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            <DailyGoalWidget userId={session.user.id} />
            <DailyReviewWidget studentProfileId={profile?.id} />
            <LeaderboardWidget board={profile?.board} grade={profile?.grade} currentUserId={session.user.id} />
            <BadgesWidget studentProfileId={profile?.id} />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="p-10 text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-teal-900">Unable to load dashboard</h2>
        <p className="text-zinc-500 max-w-xs mx-auto">We encountered an issue while fetching your statistics. Please try refreshing the page.</p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button className="bg-teal-600 text-white rounded-xl font-bold px-8 h-12 shadow-lg shadow-teal-600/20">
              Retry Connection
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
