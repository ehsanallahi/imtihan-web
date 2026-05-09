import { 
  Users, 
  ListOrdered, 
  BookOpen, 
  TrendingUp,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { getWaitlist } from "@/actions/waitlist";
import { getAdminStats } from "@/actions/adminActions";
import { db } from "@/lib/db";
import { Zap } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon className="w-6 h-6 text-teal-600" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  </div>
);

export default async function AdminDashboard() {
  const { data: waitlist } = await getWaitlist();
  const { data: statsData } = await getAdminStats();
  
  const stats = [
    { 
      title: "Waitlist Entries", 
      value: waitlist?.length || 0, 
      icon: ListOrdered, 
      color: "bg-teal-100",
      trend: "+12%" 
    },
    { 
      title: "Total Students", 
      value: statsData?.students || 0, 
      icon: Users, 
      color: "bg-blue-100",
      trend: "+5%" 
    },
    { 
      title: "MCQs Bank", 
      value: statsData?.mcqs || 0, 
      icon: BookOpen, 
      color: "bg-purple-100",
      trend: "+24" 
    },
    { 
      title: "Premium Users", 
      value: statsData?.premium || 0, 
      icon: Zap, 
      color: "bg-gold-100",
      trend: "Live" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back, Admin!</h1>
        <p className="text-slate-500 font-medium italic">Here is what's happening on Imtihan today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Waitlist Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900">Recent Waitlist Signups</h3>
            <button className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-0">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                 </tr>
               </thead>
               <tbody>
                  {waitlist?.slice(0, 5).map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{entry.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{entry.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold uppercase">
                          {entry.grade || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-teal-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-teal-900/40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
           <h3 className="text-2xl font-black mb-6 relative z-10">System Status</h3>
           <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                 <span className="font-bold text-sm">Database</span>
                 <span className="flex items-center gap-2 text-xs font-black text-emerald-400">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> ONLINE
                 </span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                 <span className="font-bold text-sm">AI Tutor Service</span>
                 <span className="flex items-center gap-2 text-xs font-black text-emerald-400">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> STABLE
                 </span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                 <span className="font-bold text-sm">Prisma Client</span>
                 <span className="flex items-center gap-2 text-xs font-black text-teal-200">
                   READY
                 </span>
              </div>
              
              <div className="pt-8">
                 <p className="text-xs text-teal-300 font-medium mb-4">You have full control over the platform's core services.</p>
                 <button className="w-full bg-white text-teal-900 py-3 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all">
                   Manage Roles
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
