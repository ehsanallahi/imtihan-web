import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Target, Trophy, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getChapterMastery } from "@/actions/analyticsActions";
import MasteryHeatmap from "@/components/study/analytics/MasteryHeatmap";

export const metadata = {
  title: "Analytics | Imtihan",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  // Fetch student profile for streak (if it exists)
  let profile = null;
  if (session?.user?.id) {
    profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    });
  }
  
  const masteryResult = await getChapterMastery();

  const streak = profile?.studyStreak || 0;

  // Fetch all completed exam sessions for this user
  const examSessions = await db.examSession.findMany({
    where: {
      studentId: session.user.id,
      completedAt: { not: null }
    },
    orderBy: { completedAt: 'desc' }
  });

  // Fetch subjects separately
  const subjectIds = [...new Set(examSessions.map(s => s.subjectId).filter(Boolean))];
  const subjects = await db.subject.findMany({
    where: { id: { in: subjectIds } }
  });
  
  const subjectMap = {};
  subjects.forEach(s => {
    subjectMap[s.id] = s.name;
  });

  const totalSessions = examSessions.length;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalTime = 0;

  // Subject-wise grouping
  const subjectStats = {};

  examSessions.forEach(s => {
    totalQuestions += s.totalQuestions;
    totalCorrect += s.correctAnswers;
    if (s.timeTakenSeconds) totalTime += s.timeTakenSeconds;

    if (s.subjectId && subjectMap[s.subjectId]) {
      if (!subjectStats[s.subjectId]) {
        subjectStats[s.subjectId] = {
          name: subjectMap[s.subjectId],
          totalQuestions: 0,
          correctAnswers: 0,
          sessions: 0
        };
      }
      subjectStats[s.subjectId].totalQuestions += s.totalQuestions;
      subjectStats[s.subjectId].correctAnswers += s.correctAnswers;
      subjectStats[s.subjectId].sessions += 1;
    }
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Your Progress</h1>
        <p className="text-slate-500 font-medium text-lg">Track your learning journey and accuracy over time.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={Target} 
          label="Overall Accuracy" 
          value={`${overallAccuracy}%`} 
          color="bg-[#1CB0F6]" 
          borderColor="border-[#1899D6]" 
          textColor="text-[#1CB0F6]" 
        />
        <StatCard 
          icon={BrainCircuit} 
          label="Quizzes Taken" 
          value={totalSessions.toString()} 
          color="bg-[#00CD9C]" 
          borderColor="border-[#00A880]" 
          textColor="text-[#00CD9C]" 
        />
        <StatCard 
          icon={Flame} 
          label="Day Streak" 
          value={streak.toString()} 
          color="bg-[#FF9600]" 
          borderColor="border-[#D98000]" 
          textColor="text-[#FF9600]" 
        />
        <StatCard 
          icon={Trophy} 
          label="Questions Answered" 
          value={totalQuestions.toString()} 
          color="bg-[#FFD900]" 
          borderColor="border-[#E5C300]" 
          textColor="text-[#D9A300]" 
        />
      </div>

      {/* Mastery Heatmap */}
      {masteryResult.success && <MasteryHeatmap data={masteryResult.data} />}

      {/* Subject Breakdown */}
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Subject Breakdown</h2>
      
      {Object.values(subjectStats).length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 font-medium text-lg">You haven't taken any quizzes yet!</p>
          <Link href="/study" className="text-[#1CB0F6] font-bold hover:underline mt-2 inline-block">
            Start practicing now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {Object.values(subjectStats).map((sub, idx) => {
            const accuracy = sub.totalQuestions > 0 ? Math.round((sub.correctAnswers / sub.totalQuestions) * 100) : 0;
            return (
              <div key={idx} className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-6 flex flex-col shadow-[0_4px_0_0_#E5E5E5]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#3C3C3C] text-xl">{sub.name}</h3>
                  <div className="text-sm font-bold text-[#777777] bg-slate-100 px-3 py-1 rounded-full">
                    {sub.sessions} Quizzes
                  </div>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
                  <span className={`text-2xl font-black ${accuracy >= 80 ? 'text-[#00CD9C]' : accuracy >= 50 ? 'text-[#FF9600]' : 'text-[#FF4B4B]'}`}>
                    {accuracy}%
                  </span>
                </div>
                
                <div className="w-full h-4 bg-[#E5E5E5] rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${accuracy >= 80 ? 'bg-[#00CD9C]' : accuracy >= 50 ? 'bg-[#FF9600]' : 'bg-[#FF4B4B]'}`}
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
                
                <div className="text-sm font-medium text-[#777777] text-right">
                  {sub.correctAnswers} / {sub.totalQuestions} correct
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent History */}
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Recent Activity</h2>
      <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] overflow-hidden shadow-[0_4px_0_0_#E5E5E5]">
        {examSessions.slice(0, 5).map((session, idx) => {
          const acc = session.totalQuestions > 0 ? Math.round((session.correctAnswers / session.totalQuestions) * 100) : 0;
          return (
            <div key={session.id} className={`p-4 sm:p-6 flex items-center justify-between gap-3 ${idx !== 0 ? 'border-t-2 border-[#E5E5E5]' : ''}`}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white border-b-4 text-sm sm:text-base flex-shrink-0 ${acc >= 80 ? 'bg-[#00CD9C] border-[#00A880]' : acc >= 50 ? 'bg-[#FF9600] border-[#D98000]' : 'bg-[#FF4B4B] border-[#D93838]'}`}>
                  {acc}%
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-[#3C3C3C] text-base sm:text-lg truncate">{subjectMap[session.subjectId] || 'Quiz'}</h4>
                  <p className="text-xs sm:text-sm font-medium text-[#777777]">{new Date(session.completedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Link href={`/study/quiz/results/${session.id}`}>
                <button className="text-[#1CB0F6] font-bold uppercase text-xs sm:text-sm tracking-wider hover:text-[#1899D6] transition-colors flex items-center gap-1 flex-shrink-0">
                  Review <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          );
        })}
        {examSessions.length === 0 && (
          <div className="p-8 text-center text-[#777777] font-medium">No recent activity.</div>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, borderColor, textColor }) {
  return (
    <div className={`rounded-[2rem] border-2 border-[#E5E5E5] p-6 flex flex-col items-center text-center bg-white shadow-[0_4px_0_0_#E5E5E5] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#E5E5E5] transition-all`}>
      <div className={`w-14 h-14 rounded-2xl ${color} border-b-[4px] ${borderColor} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className={`text-3xl font-display font-black mb-1 ${textColor}`}>
        {value}
      </div>
      <div className="text-sm font-bold text-[#777777] uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
