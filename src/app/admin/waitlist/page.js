import { getWaitlist } from "@/actions/waitlist";
import { format } from "date-fns";
import { 
  Download, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Phone
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminWaitlistPage() {
  const { data: entries, error } = await getWaitlist();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading waitlist: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Waitlist Management</h1>
          <p className="text-slate-500 font-medium italic">Manage and export early access student signups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
            <span>Showing {entries?.length || 0} entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date Joined</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Info</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade & Board</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries?.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-900">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {format(new Date(entry.createdAt), "HH:mm a")}
                    </p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-sm">
                        {entry.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{entry.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors cursor-pointer">
                            <Mail className="w-3 h-3" /> {entry.email}
                          </span>
                          {entry.phone && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors cursor-pointer">
                              <Phone className="w-3 h-3" /> {entry.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {entry.grade || "General"}
                      </span>
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-100">
                        {entry.board || "All Boards"}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {entries?.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <ListOrdered className="w-8 h-8" />
                       </div>
                       <div>
                          <p className="font-black text-slate-900">No entries yet</p>
                          <p className="text-sm text-slate-400 font-medium">Waitlist signups will appear here automatically.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/30 border-t border-slate-100 text-center">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
             End of Records • Imtihan Admin Platform v1.0
           </p>
        </div>
      </div>
    </div>
  );
}
