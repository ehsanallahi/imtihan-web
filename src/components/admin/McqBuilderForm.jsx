"use client";

import { useState, useTransition } from "react";
import { createMcq } from "@/actions/adminActions";
import { 
  Save, 
  Sparkles, 
  Type, 
  HelpCircle, 
  Layout, 
  Languages,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function McqBuilderForm({ subjects }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    question: "",
    questionUrdu: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "a",
    explanation: "",
    subjectId: "",
    chapterId: ""
  });

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);
  const chapters = selectedSubject?.chapters || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.chapterId) {
      toast.error("Please select a subject and chapter");
      return;
    }

    startTransition(async () => {
      const result = await createMcq(formData);
      if (result.success) {
        toast.success("MCQ created successfully!");
        router.push("/admin/content");
        router.refresh();
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Question Section */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Type className="w-5 h-5 text-teal-600" />
                 <h3 className="font-black text-slate-900 uppercase tracking-tight">The Question</h3>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">English Content</label>
                    <textarea 
                      required
                      placeholder="Enter the question in English..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium text-slate-900 min-h-[120px]"
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                       <span>اردو مواد</span>
                       <Languages className="w-3 h-3" />
                    </label>
                    <textarea 
                      placeholder="...اردو میں سوال لکھیں"
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-urdu text-right text-teal-900 min-h-[120px]"
                      value={formData.questionUrdu}
                      onChange={(e) => setFormData({...formData, questionUrdu: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <HelpCircle className="w-5 h-5 text-teal-600" />
                 <h3 className="font-black text-slate-900 uppercase tracking-tight">Explanation</h3>
              </div>
              <textarea 
                placeholder="Explain why the correct answer is right..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm font-medium text-slate-600 min-h-[100px]"
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              />
           </div>
        </div>

        {/* Options & Classification */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Layout className="w-5 h-5 text-teal-600" />
                 <h3 className="font-black text-slate-900 uppercase tracking-tight">Classification</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                    <select 
                      required
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({...formData, subjectId: e.target.value, chapterId: ""})}
                    >
                       <option value="">Select Subject</option>
                       {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (G{s.grade})</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Chapter</label>
                    <select 
                      required
                      disabled={!formData.subjectId}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 disabled:opacity-50"
                      value={formData.chapterId}
                      onChange={(e) => setFormData({...formData, chapterId: e.target.value})}
                    >
                       <option value="">Select Chapter</option>
                       {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                 <Sparkles className="w-5 h-5 text-teal-400" />
                 <h3 className="font-black uppercase tracking-tight">Options Configuration</h3>
              </div>

              <div className="space-y-4 relative z-10">
                 {['a', 'b', 'c', 'd'].map((opt) => (
                   <div key={opt} className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, correctOption: opt})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black uppercase transition-all ${formData.correctOption === opt ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/40 scale-110' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                      >
                         {opt}
                      </button>
                      <input 
                        required
                        type="text" 
                        placeholder={`Option ${opt.toUpperCase()}...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white/10 focus:border-teal-500/50 outline-none transition-all"
                        value={formData[`option${opt.toUpperCase()}`]}
                        onChange={(e) => setFormData({...formData, [`option${opt.toUpperCase()}`]: e.target.value})}
                      />
                   </div>
                 ))}
              </div>

              <div className="pt-6">
                 <button 
                   disabled={isPending}
                   className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-teal-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50"
                 >
                    {isPending ? "Creating MCQ..." : "Publish Question"}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </form>
  );
}
