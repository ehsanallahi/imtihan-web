import { getAdminUsers } from "@/actions/adminActions";
import { 
  ShieldCheck, 
  Search, 
  UserPlus, 
  MoreVertical,
  Mail,
  ShieldAlert,
  Settings2
} from "lucide-react";
import RoleBadge from "@/components/admin/RoleBadge";
import RoleManager from "@/components/admin/RoleManager";

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const { data: staff, error } = await getAdminUsers();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading staff data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Staff & Role Management <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </h1>
          <p className="text-slate-500 font-medium italic">Manage administrative roles and permissions for the Imtihan platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search staff by name or email..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Staff Member</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Current Role</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Permissions</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff?.map((member) => (
                <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                        {member.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Mail className="w-3 h-3" /> {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                     <RoleBadge role={member.role} />
                  </td>
                  <td className="p-5">
                    <div className="flex gap-1 flex-wrap">
                       {member.role === "super_admin" ? (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-amber-100">Full Access</span>
                       ) : (
                          <>
                             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Read</span>
                             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Write</span>
                          </>
                       )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <RoleManager userId={member.id} currentRole={member.role} />
                       <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
         <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-xl">
               <h3 className="text-xl font-black flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-amber-400" /> Security Note
               </h3>
               <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                  Administrative roles provide significant power over platform data. Always verify the identity of a staff member before elevating their privileges. All role changes are logged in the <span className="font-black text-white italic underline">Audit Logs</span>.
               </p>
            </div>
            <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl whitespace-nowrap">
               Review Permission Policy
            </button>
         </div>
      </div>
    </div>
  );
}
