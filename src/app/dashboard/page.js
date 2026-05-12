import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, ArrowRight, BookOpen, Flame, Users, AlertCircle, Settings2, GraduationCap,
  CheckCircle2, BrainCircuit, Clock
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-teal-900 to-teal-800 p-8 rounded-[2rem] text-white shadow-xl shadow-teal-900/20">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
              Hello, {targetUser?.name?.split(' ')[0] || "Student"}! 👋
            </h1>
            <p className="text-teal-100/80 max-w-md">
              You've solved {totalQs} questions so far. Ready to crush some more today?
            </p>
          </div>
          <Link href="/study">
            <Button size="lg" className="bg-white text-teal-900 hover:bg-teal-50 rounded-2xl font-black px-8 h-14 shadow-lg shadow-white/10 group">
              Resume Learning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} opacity-20 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                    <div className="text-2xl font-black font-display text-teal-900 mt-0.5">{stat.value}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tip / Onboarding */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
           <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
           </div>
           <div className="text-xs">
              <p className="font-bold">Pro Tip: Goal Setting</p>
              <p className="opacity-80">You can adjust your daily MCQ target in <Link href="/dashboard/settings" className="underline font-bold">Settings</Link> to match your study pace!</p>
           </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
          {/* Recent Activity */}
          <Card className="md:col-span-5 border-none shadow-sm overflow-hidden">
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

          <Card className="md:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-display font-bold text-teal-900">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Link href="/study" className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-100/50">
                <BookOpen className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Study Hub</p>
                  <p className="text-[10px] opacity-70 truncate">Browse Subjects</p>
                </div>
              </Link>
              <Link href="/study/analytics" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100/50">
                <GraduationCap className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Performance</p>
                  <p className="text-[10px] opacity-70 truncate">View Analytics</p>
                </div>
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/50">
                <Settings2 className="w-5 h-5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Settings</p>
                  <p className="text-[10px] opacity-70 truncate">Update Profile</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
            <h2 className="text-xl font-display font-bold text-teal-900 uppercase tracking-tight">My Growth</h2>
          </div>
          
          {profile?.id && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
              <DailyGoalWidget userId={session.user.id} />
              <DailyReviewWidget studentProfileId={profile?.id} />
              <LeaderboardWidget board={profile?.board} grade={profile?.grade} currentUserId={session.user.id} />
              <BadgesWidget studentProfileId={profile?.id} />
            </div>
          )}
        </div>
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
