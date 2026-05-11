import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentGamificationData } from "@/actions/gamificationActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Medal, Star, Trophy, Lock, CheckCircle2, Info } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Achievements | Imtihan",
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const result = await getStudentGamificationData();
  
  if (!result.success || !result.data) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-teal-900">Unable to load achievements</h2>
        <p className="text-zinc-500 max-w-xs mx-auto">We encountered an issue fetching your gamification data.</p>
      </div>
    );
  }

  const { profile, achievements } = result.data;
  const unlocked = achievements.filter(a => a.isUnlocked);
  const locked = achievements.filter(a => !a.isUnlocked);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black tracking-tight text-slate-800 flex items-center gap-3">
          <Medal className="w-8 h-8 text-indigo-500" />
          Achievements & Badges
        </h1>
        <p className="text-slate-500 font-medium mt-1">Track your progress and unlock rewards</p>
      </div>

      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] rounded-[2rem] overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF9600] to-[#FFB040] h-3" />
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#777777] uppercase tracking-wider mb-1">Current Streak</p>
              <div className="text-5xl font-black text-[#FF9600] font-display flex items-end gap-2">
                {profile.studyStreak} <span className="text-lg text-[#FF9600]/80 mb-2">Days</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-[#FF9600]/10 rounded-full flex items-center justify-center border-4 border-[#FF9600]/20">
              <Flame className="w-10 h-10 text-[#FF9600]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] rounded-[2rem] overflow-hidden">
          <div className="bg-gradient-to-r from-[#1CB0F6] to-[#40C4FF] h-3" />
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#777777] uppercase tracking-wider mb-1">Badges Unlocked</p>
              <div className="text-5xl font-black text-[#1CB0F6] font-display flex items-end gap-2">
                {unlocked.length} <span className="text-lg text-[#1CB0F6]/80 mb-2">/ {achievements.length}</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-[#1CB0F6]/10 rounded-full flex items-center justify-center border-4 border-[#1CB0F6]/20">
              <Trophy className="w-10 h-10 text-[#1CB0F6]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Badges */}
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-amber-400" />
        Unlocked Badges
      </h2>
      
      {unlocked.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center mb-12">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-lg">You haven't unlocked any badges yet.</p>
          <p className="text-sm text-slate-400">Keep studying to earn your first reward!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {unlocked.map(ach => (
            <div key={ach.id} className="group relative bg-white border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] rounded-2xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
              <div className="absolute top-3 right-3 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border-4 border-indigo-50 group-hover:scale-110 transition-transform shadow-inner">
                <Medal className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{ach.title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight px-2">{ach.description}</p>
              {ach.unlockedAt && (
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-4">
                  {format(new Date(ach.unlockedAt), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Locked Badges */}
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Lock className="w-6 h-6 text-slate-400" />
        Locked Achievements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locked.map(ach => (
          <div key={ach.id} className="bg-slate-50 border-2 border-[#E5E5E5] rounded-2xl p-6 flex flex-col grayscale opacity-80">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-slate-100">
                <Lock className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 text-lg">{ach.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-black text-slate-600">{ach.progress} / {ach.target}</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: \`\${ach.progressPercentage}%\` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
