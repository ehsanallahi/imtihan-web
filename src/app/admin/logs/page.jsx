import { getAuditLogs } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  History, 
  Search, 
  Filter,
  User,
  Activity,
  Shield,
  Info
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const { data: logs, error } = await getAuditLogs();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading audit logs: {error}
      </div>
    );
  }

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "bg-rose-50 text-rose-600 border-rose-100";
    if (action.includes("CREATE")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (action.includes("UPDATE") || action.includes("APPROVE")) return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            System Audit Logs <History className="w-8 h-8 text-teal-600" />
          </h1>
          <p className="text-slate-500 font-medium italic">Track all administrative actions across the platform for security and compliance.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by action, admin or entity..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
            <span>Showing {logs?.length || 0} recent actions</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Administrator</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Entity</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs?.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-900">
                      {format(new Date(log.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {format(new Date(log.createdAt), "HH:mm:ss a")}
                    </p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{log.user?.name || "Unknown"}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{log.user?.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-700">{log.entity || "N/A"}</span>
                       <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">{log.entityId || ""}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    {log.details ? (
                      <div className="group relative">
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-teal-600 transition-all flex items-center gap-2">
                           <Info className="w-4 h-4" />
                           <span className="text-[10px] font-bold uppercase">View Data</span>
                        </button>
                        {/* Simple Tooltip on Hover */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                           <div className="bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl w-64 max-h-40 overflow-auto font-mono">
                              {JSON.stringify(log.details, null, 2)}
                           </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic font-medium">No extra data</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                       <Activity className="w-12 h-12" />
                       <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No logs recorded yet</p>
                    </div>
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
