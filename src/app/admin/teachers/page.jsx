import { getAdminTeachers } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  School,
  ShieldCheck
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminTeachersPage() {
  const { data: teachers, error } = await getAdminTeachers();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading teachers: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Teacher Management</h1>
          <p className="text-slate-500 font-medium italic">Manage verified educators and their institutional affiliations.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
              Verify New Teacher
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search teachers..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Teacher</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Institution</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Specialty</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers?.map((teacher) => (
                <tr key={teacher.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                        {teacher.name?.[0] || "T"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-slate-900">{teacher.name}</p>
                           <ShieldCheck className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Mail className="w-3 h-3" /> {teacher.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <School className="w-4 h-4 text-slate-400" />
                       <span className="font-bold text-sm text-slate-700">
                          {teacher.teacherProfile?.institution?.name || "Independent Educator"}
                       </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                       {teacher.teacherProfile?.subjectSpecialty || "General"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {teachers?.length === 0 && (
                <tr>
                   <td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">
                      No verified teachers found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
