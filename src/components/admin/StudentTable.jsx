"use client";

import { useRouter } from "next/navigation";
import { Mail, GraduationCap, Zap, MoreVertical } from "lucide-react";

export default function StudentTable({ students }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade & Board</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Performance</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Plan</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students?.map((student) => (
            <tr 
              key={student.id} 
              className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/students/${student.id}`)}
            >
              <td className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black relative overflow-hidden group-hover:shadow-md transition-all">
                    {student.avatar ? (
                      <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      student.name?.[0] || "S"
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{student.name || "Unknown Student"}</p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                      <Mail className="w-3 h-3" /> {student.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-5">
                <div className="space-y-1">
                  <p className="text-xs font-black text-teal-900 uppercase tracking-tight flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> {student.studentProfile?.grade || "Not Set"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {student.studentProfile?.board || "All Boards"}
                  </p>
                </div>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Streak</span>
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
                         <Zap className="w-3 h-3 fill-current" /> {student.studentProfile?.studyStreak || 0}
                      </span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">MCQs</span>
                      <span className="text-xs font-bold text-slate-700">
                         {student.studentProfile?.totalMcqsAttempted || 0}
                      </span>
                   </div>
                </div>
              </td>
              <td className="p-5">
                {student.role === "premium_student" ? (
                  <span className="bg-gold-50 text-gold-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gold-100 flex items-center gap-1 w-fit">
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" /> Pro Plan
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                    Free User
                  </span>
                )}
              </td>
              <td className="p-5 text-right">
                <button 
                  onClick={(e) => { e.stopPropagation(); /* handle more */ }}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
