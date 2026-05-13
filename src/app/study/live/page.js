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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/study">
            <div className="p-2 rounded-xl bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-800">National Live Exams</h1>
            <p className="text-slate-500 font-medium">Compete against the best and prove your mastery.</p>
          </div>
        </div>
        
        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl px-6 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Your Rank</p>
            <p className="text-xl font-black text-indigo-900 leading-none">#--</p>
          </div>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-400">No Exams Scheduled</h2>
          <p className="text-slate-400 font-medium mt-2 max-w-md mx-auto">
            Our team is currently preparing the next batch of national mock exams. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {exams.map((exam) => (
            <LiveExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
