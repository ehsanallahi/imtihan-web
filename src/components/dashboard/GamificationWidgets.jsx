import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star, Flame, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";

export async function LeaderboardWidget({ board, grade, currentUserId }) {
  if (!board || !grade) {
    return (
      <Card className="border-none shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-xl font-display font-bold text-teal-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-500 text-center py-6">
            Complete your profile (Grade & Board) in Settings to join the Leaderboard!
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch top 5 students in the same board and grade based on studyStreak
  const topStudents = await db.studentProfile.findMany({
    where: { board, grade },
    orderBy: { studyStreak: "desc" },
    take: 5,
    include: { user: { select: { name: true, avatar: true } } }
  });

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl font-display font-bold text-teal-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          {board} Board Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStudents.map((student, index) => {
            const isMe = student.userId === currentUserId;
            return (
              <div key={student.id} className={`flex items-center justify-between p-2 rounded-lg ${isMe ? 'bg-amber-50 border border-amber-200' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'text-zinc-400'}`}>
                    {index + 1}
                  </div>
                  <p className={`text-sm font-medium ${isMe ? 'text-amber-900' : 'text-zinc-700'}`}>
                    {isMe ? "You" : (student.user.name || "Anonymous")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{student.studyStreak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export async function BadgesWidget({ studentProfileId }) {
  if (!studentProfileId) return null;

  const achievements = await db.studentAchievement.findMany({
    where: { studentProfileId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
    take: 4
  });

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl font-display font-bold text-teal-900 flex items-center gap-2">
          <Medal className="w-5 h-5 text-indigo-500" />
          Recent Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center py-6 border-2 border-dashed border-zinc-100 rounded-xl">
            Complete quizzes and maintain your study streak to earn badges!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((record) => (
              <div key={record.id} className="flex flex-col items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-indigo-900">{record.achievement.title}</p>
                <p className="text-[10px] text-indigo-600 mt-1">{record.achievement.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export async function DailyReviewWidget({ studentProfileId }) {
  if (!studentProfileId) return null;

  const dueForReviewCount = await db.studentMCQProgress.count({
    where: {
      studentProfileId,
      nextReviewDate: { lte: new Date() }
    }
  });

  return (
    <Card className="border-none shadow-sm h-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
      <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full space-y-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <CalendarClock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold">Daily Review</h3>
          <p className="text-indigo-100 text-sm mt-1">Spaced Repetition Queue</p>
        </div>
        
        {dueForReviewCount > 0 ? (
          <div className="space-y-4 w-full">
            <div className="bg-white/10 rounded-lg p-3">
              <span className="text-3xl font-black">{dueForReviewCount}</span>
              <span className="text-indigo-200 text-sm ml-2">Questions Due</span>
            </div>
            <Link href="/study/review" className="block w-full">
              <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold">
                Start Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-4 w-full border border-white/20 mt-4">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-300 mb-2" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-indigo-200 mt-1">Check back tomorrow.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
