"use client";

import { useState, useTransition } from "react";
import { approveMcq, deleteMcq } from "@/actions/adminActions";
import { 
  CheckCircle2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function McqReviewList({ initialMcqs }) {
  const [mcqs, setMcqs] = useState(initialMcqs);
  const [expandedId, setExpandedId] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = async (id) => {
    startTransition(async () => {
      const result = await approveMcq(id);
      if (result.success) {
        setMcqs(mcqs.filter(m => m.id !== id));
        toast.success("MCQ Approved!");
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this MCQ?")) return;
    
    startTransition(async () => {
      const result = await deleteMcq(id);
      if (result.success) {
        setMcqs(mcqs.filter(m => m.id !== id));
        toast.error("MCQ Deleted");
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  if (mcqs.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
         <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
         <h3 className="text-xl font-black text-slate-900">All caught up!</h3>
         <p className="text-slate-500 font-medium italic">No pending MCQs to review at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mcqs.map((mcq) => (
        <div key={mcq.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-teal-500/30">
           <div 
             className="p-6 flex items-center justify-between cursor-pointer"
             onClick={() => setExpandedId(expandedId === mcq.id ? null : mcq.id)}
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    {mcq.isAiGenerated ? <Sparkles className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{mcq.question}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mcq.subject?.name}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mcq.chapter?.name}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex gap-2">
                    <button 
                      disabled={isPending}
                      onClick={(e) => { e.stopPropagation(); handleApprove(mcq.id); }}
                      className="bg-emerald-50 text-emerald-600 p-2 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
                    >
                       <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      disabled={isPending}
                      onClick={(e) => { e.stopPropagation(); handleDelete(mcq.id); }}
                      className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
                 {expandedId === mcq.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
           </div>

           {expandedId === mcq.id && (
             <div className="px-6 pb-6 pt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Question (English)</p>
                         <p className="text-sm font-bold text-slate-900 leading-relaxed">{mcq.question}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-2 font-urdu">سوال (اردو)</p>
                         <p className="text-sm font-bold text-teal-900 leading-relaxed font-urdu text-right">{mcq.questionUrdu || "Urdu translation missing"}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Options</p>
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt} className={`p-4 rounded-2xl border flex items-center justify-between ${mcq.correctOption === opt ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                           <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black uppercase ${mcq.correctOption === opt ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                 {opt}
                              </span>
                              <span className={`text-sm font-bold ${mcq.correctOption === opt ? 'text-emerald-900' : 'text-slate-700'}`}>
                                 {mcq[`option${opt.toUpperCase()}`]}
                              </span>
                           </div>
                           {mcq.correctOption === opt && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="mt-6 bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-purple-600 shrink-0" />
                   <div>
                      <p className="text-xs font-black text-purple-900 uppercase">Explanation</p>
                      <p className="text-xs font-medium text-purple-800/80 mt-1 leading-relaxed">
                         {mcq.explanation || "No explanation provided for this question."}
                      </p>
                   </div>
                </div>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}

const FileText = ({ size, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
