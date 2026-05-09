import { getPendingMcqs } from "@/actions/adminActions";
import McqReviewList from "@/components/admin/McqReviewList";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminMcqReviewPage() {
  const { data: mcqs, error } = await getPendingMcqs();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading pending MCQs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin/content" className="text-teal-600 text-xs font-black uppercase flex items-center gap-1 hover:gap-2 transition-all mb-4">
             <ArrowLeft className="w-3 h-3" /> Back to Repository
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             MCQ Review Center <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-purple-200">Pending Review</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Verify and approve AI-generated questions before they go live.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Queue</p>
              <p className="text-xl font-black text-slate-900">{mcqs?.length || 0}</p>
           </div>
           <div className="w-[1px] h-8 bg-slate-100" />
           <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5 fill-current" />
              <span className="text-xs font-black uppercase tracking-tight">AI Audit Ready</span>
           </div>
        </div>
      </div>

      <McqReviewList initialMcqs={mcqs || []} />
    </div>
  );
}
