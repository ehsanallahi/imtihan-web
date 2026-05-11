import { getAiUsageStats } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Zap,
  Clock
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminAiMonitorPage() {
  const { data: stats, error } = await getAiUsageStats();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading AI usage data: {error}
      </div>
    );
  }

  const overviewStats = [
    { label: "Total AI Requests", value: stats?.total?.toLocaleString(), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Daily Avg.", value: Math.round(stats?.total / 30).toLocaleString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Users (AI)", value: stats?.topUsers?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "System Health", value: "Optimal", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            AI Service Monitor <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </h1>
          <p className="text-slate-500 font-medium italic">Monitor token usage, request patterns, and AI Tutor performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {overviewStats.map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                 <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
           </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Usage Chart (Mocked visualization with bars) */}
         <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" /> Usage Trend (30 Days)
               </h3>
               <span className="text-xs font-bold text-slate-400 uppercase">Requests per day</span>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
               {stats?.dailyUsage?.map((day, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-purple-100 group-hover:bg-purple-500 rounded-t-lg transition-all relative"
                      style={{ height: `${Math.min(100, (day._sum.count / (stats.total / 15)) * 100)}%` }}
                    >
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10">
                          {day._sum.count} requests
                       </div>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase transform -rotate-45 mt-2">
                       {format(new Date(day.date), "MMM d")}
                    </span>
                 </div>
               ))}
               {(!stats?.dailyUsage || stats.dailyUsage.length === 0) && (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 italic">
                     Insufficient data to render chart
                  </div>
               )}
            </div>
         </div>

         {/* Top Users */}
         <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
               <Users className="w-5 h-5 text-purple-400" /> Top Consumers
            </h3>
            
            <div className="space-y-6">
               {stats?.topUsers?.map((u, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">
                          {i + 1}
                       </div>
                       <div>
                          <p className="text-sm font-bold truncate max-w-[120px]">{u.user?.name || "Deleted User"}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{u.user?.email}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-purple-400">{u._sum.count}</p>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">REQ</p>
                    </div>
                 </div>
               ))}
               {(!stats?.topUsers || stats.topUsers.length === 0) && (
                  <p className="text-center text-slate-500 italic text-sm py-12">No usage recorded</p>
               )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
               <div className="flex items-start gap-3 bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                  <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-purple-100 leading-relaxed">
                     <span className="font-black text-white">PRO TIP:</span> High usage from free-tier students may indicate a need for more restrictive rate limiting.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
