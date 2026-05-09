import { getAdminStudents } from "@/actions/adminActions";
import StudentTable from "@/components/admin/StudentTable";
import { 
  Search, 
  Filter
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

        <StudentTable students={students || []} />
      </div>
    </div>
  );
}
