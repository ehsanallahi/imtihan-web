import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUpcomingLiveExams } from "@/actions/liveExamActions";
import LiveExamCard from "@/components/study/LiveExamCard";
import Link from "next/link";
import { ChevronLeft, Trophy, Calendar } from "lucide-react";

export const metadata = {
  title: "Live Mock Exams | Imtihan",
};

export default async function LiveExamsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const exams = await getUpcomingLiveExams();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <Link href="/study" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 font-black text-xs uppercase tracking-widest transition-colors mb-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Hub
              </Link>
              <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight">
                National Competition Hub
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                The grand stage where thousands of students compete in real-time. Prove your mastery and climb the national leaderboard.
              </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="bg-teal-50 border-2 border-teal-100 rounded-[2rem] px-8 py-4 flex items-center gap-4 shadow-sm shadow-teal-500/5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Your National Rank</p>
                    <p className="text-3xl font-black text-slate-900 leading-none">#--</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-2 h-8 bg-teal-500 rounded-full" />
           <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-widest">Available Mock Exams</h2>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 p-24 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
               <Calendar className="w-12 h-12 text-slate-200" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">No Exams Scheduled</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              Our experts are currently curating the next set of national mock exams. Check back tomorrow!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {exams.map((exam) => (
              <LiveExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
