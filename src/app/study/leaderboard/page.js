import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Trophy, Medal, Flame, ArrowLeft } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  // Get top 20 students by total correct answers
  const topStudents = await db.examSession.groupBy({
    by: ["studentId"],
    where: { completedAt: { not: null } },
    _sum: { correctAnswers: true, totalQuestions: true },
    _count: { id: true },
    orderBy: { _sum: { correctAnswers: "desc" } },
    take: 20,
  });

  const userIds = topStudents.map((s) => s.studentId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const currentUserId = session?.user?.id;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link href="/study" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Study
        </Link>
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-950 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" /> Leaderboard
        </h1>
        <p className="text-zinc-500 mt-1">Top students by total correct answers</p>
      </div>

      {topStudents.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
          <Trophy className="w-12 h-12 text-teal-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-teal-900 mb-1">No data yet</h3>
          <p className="text-zinc-500">Complete some quizzes to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top 3 podium */}
          {topStudents.length >= 3 && (
            <div className="bg-gradient-to-br from-teal-600 to-emerald-500 p-6 flex items-end justify-center gap-4">
              {[topStudents[1], topStudents[0], topStudents[2]].map((s, idx) => {
                const heights = ["h-20", "h-28", "h-16"];
                const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const acc = s._sum.totalQuestions > 0
                  ? Math.round((s._sum.correctAnswers / s._sum.totalQuestions) * 100) : 0;
                return (
                  <div key={s.studentId} className="flex flex-col items-center gap-2 text-white text-center">
                    <div className="text-2xl">{medals[rank - 1]}</div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                      {(userMap[s.studentId] || "?")[0].toUpperCase()}
                    </div>
                    <div className="text-sm font-bold truncate max-w-[80px]">{userMap[s.studentId] || "Anonymous"}</div>
                    <div className="text-xs opacity-80">{s._sum.correctAnswers} pts</div>
                    <div className={`w-16 ${heights[idx]} bg-white/20 rounded-t-xl flex items-center justify-center font-black text-xl`}>
                      #{rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          {topStudents.map((s, idx) => {
            const acc = s._sum.totalQuestions > 0
              ? Math.round((s._sum.correctAnswers / s._sum.totalQuestions) * 100) : 0;
            const isMe = s.studentId === currentUserId;
            return (
              <div key={s.studentId}
                className={`flex items-center gap-4 p-4 sm:p-5 ${idx !== 0 ? "border-t border-slate-100" : ""} ${isMe ? "bg-teal-50/60" : ""}`}>
                <div className="w-8 text-center font-bold text-zinc-400 text-sm">
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isMe ? "bg-teal-600" : "bg-slate-300"}`}>
                  {(userMap[s.studentId] || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isMe ? "text-teal-700" : "text-zinc-800"}`}>
                    {userMap[s.studentId] || "Anonymous"} {isMe && <span className="text-xs font-normal text-teal-500">(You)</span>}
                  </p>
                  <p className="text-xs text-zinc-400">{s._count.id} quizzes · {acc}% accuracy</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-900">{s._sum.correctAnswers}</div>
                  <div className="text-xs text-zinc-400">points</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
