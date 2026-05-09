import { getAdminStudents } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Zap,
  GraduationCap
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const { data: students, error } = await getAdminStudents();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading students: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Management</h1>
          <p className="text-slate-500 font-medium italic">Monitor student progress, streaks, and subscription status.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Total</span>
                 <span className="font-black text-teal-600">{students?.length || 0}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100" />
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Premium</span>
                 <span className="font-black text-gold-600">
                    {students?.filter(s => s.role === "premium_student").length || 0}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" /> Filter By Grade
          </button>
        </div>

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
                <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black relative overflow-hidden">
                        {student.avatar ? (
                          <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.name?.[0] || "S"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.name || "Unknown Student"}</p>
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
                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
