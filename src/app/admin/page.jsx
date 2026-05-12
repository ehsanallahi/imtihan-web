export const dynamic = "force-dynamic";
import { 
  Users, 
  ListOrdered, 
  BookOpen, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Zap
} from "lucide-react";
import { getWaitlist } from "@/actions/waitlist";
import { getAdminStats } from "@/actions/adminActions";
import { db } from "@/lib/db";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, textColor, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 ${textColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  </div>
);

export default async function AdminDashboard() {
  try {
    const { data: waitlist, error: waitlistError } = await getWaitlist();
    const { data: statsData, error: statsError } = await getAdminStats();
    
    if (waitlistError || statsError) {
      throw new Error(waitlistError || statsError);
    }
    
    const stats = [
      { 
        title: "Waitlist Entries", 
        value: waitlist?.length || 0, 
        icon: ListOrdered, 
        color: "bg-teal-100",
        textColor: "text-teal-600",
        trend: "+12%" 
      },
      { 
        title: "Total Students", 
        value: statsData?.students || 0, 
        icon: Users, 
        color: "bg-blue-100",
        textColor: "text-blue-600",
        trend: "+5%" 
      },
      { 
        title: "MCQs Bank", 
        value: statsData?.mcqs || 0, 
        icon: BookOpen, 
        color: "bg-purple-100",
        textColor: "text-purple-600",
        trend: "+24" 
      },
      { 
        title: "Premium Users", 
        value: statsData?.premium || 0, 
        icon: Zap, 
        color: "bg-gold-100",
        textColor: "text-amber-600",
        trend: "Live" 
      },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back, Admin!</h1>
          <p className="text-slate-500 font-medium italic">Here is what's happening on Imtihan today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard {...stats[0]} />
          <Link href="/admin/students">
            <StatCard {...stats[1]} />
          </Link>
          <StatCard {...stats[2]} />
          <StatCard {...stats[3]} />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Recent Waitlist Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900">Waitlist</h3>
              <Link href="/admin/waitlist" className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-0">
               <table className="w-full text-left">
                 <tbody>
                    {waitlist?.slice(0, 3).map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-xs">{entry.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{entry.email}</p>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>

          {/* Content Health */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
             <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-slate-900">Content Health</h3>
             </div>
             <div className="p-6 space-y-4">
                <Link href="/admin/content/review" className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all group">
                   <div>
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Pending Review</p>
                      <p className="text-xl font-black text-orange-600">{statsData?.pendingReviews || 0}</p>
                   </div>
                   <Clock className="w-5 h-5 text-orange-200 group-hover:text-orange-500 transition-colors" />
                </Link>
                <Link href="/admin/content/audit" className="flex items-center justify-between bg-rose-50 p-4 rounded-2xl border border-rose-100 hover:border-rose-300 transition-all group">
                   <div>
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Reports</p>
                      <p className="text-xl font-black text-rose-600">{statsData?.pendingReports || 0}</p>
                   </div>
                   <AlertCircle className="w-5 h-5 text-rose-200 group-hover:text-rose-500 transition-colors" />
                </Link>
             </div>
          </div>

          {/* Recent Students Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900">Students</h3>
              <Link href="/admin/students" className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-0">
               <table className="w-full text-left">
                 <tbody>
                    {statsData?.recentStudents?.slice(0, 3).map((student) => (
                      <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-xs">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{student.role.replace('_', ' ')}</p>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-teal-900/40 lg:col-span-1">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
             <h3 className="text-lg font-black mb-6 relative z-10 flex items-center gap-2">
               <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /> System
             </h3>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                   <span className="font-bold text-xs text-teal-100 text-[10px]">DB</span>
                   <span className="flex items-center gap-2 text-[8px] font-black text-emerald-400">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> ONLINE
                   </span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                   <span className="font-bold text-xs text-teal-100 text-[10px]">AI</span>
                   <span className="flex items-center gap-2 text-[8px] font-black text-emerald-400">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> STABLE
                   </span>
                </div>
                
                <div className="pt-2">
                   <Link href="/admin/settings" className="block">
                     <button className="w-full bg-white text-teal-900 py-2 rounded-xl font-black text-[10px] hover:bg-teal-50 transition-all uppercase">
                       CONFIG
                     </button>
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-zinc-500">{error.message}</p>
        <Link href="/admin">
          <button className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
        </Link>
      </div>
    );
  }
}
