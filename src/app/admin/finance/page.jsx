import { getAdminSubscriptionStats } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Download,
  Wallet,
  Activity,
  History
} from "lucide-react";
import ExportButton from "@/components/admin/ExportButton";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
  const { data: stats, error } = await getAdminSubscriptionStats();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading finance data: {error}
      </div>
    );
  }

  const overviewStats = [
    { label: "Active Subscriptions", value: stats?.activeCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Monthly Recurring Revenue", value: `Rs. ${stats?.mrr?.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Life-Time Revenue", value: `Rs. ${stats?.totalRevenue?.toLocaleString()}`, icon: Wallet, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Growth Rate", value: "+18.2%", icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Financial Overview</h1>
          <p className="text-slate-500 font-medium italic">Monitor platform revenue, subscriptions, and financial growth.</p>
        </div>
        <div className="flex items-center gap-3">
           <ExportButton 
            data={stats?.recentPayments?.map(p => ({ ...p, userName: p.user?.name, userEmail: p.user?.email }))} 
            filename="imtihan_revenue_report" 
            headers={["userName", "userEmail", "plan", "amountPkr", "startDate"]} 
          />
        </div>
      </div>

      {/* Stats Grid */}
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
         {/* Recent Payments */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                     <History className="w-5 h-5 text-teal-600" />
                     <h3 className="font-black text-slate-900">Recent Transactions</h3>
                  </div>
                  <button className="text-xs font-black text-teal-600 hover:underline uppercase tracking-widest">
                     View All
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {stats?.recentPayments?.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="p-5">
                                <p className="text-xs font-bold text-slate-900">{format(new Date(sub.startDate), "MMM d, yyyy")}</p>
                             </td>
                             <td className="p-5">
                                <p className="text-xs font-bold text-slate-900">{sub.user?.name}</p>
                                <p className="text-[10px] font-medium text-slate-400">{sub.user?.email}</p>
                             </td>
                             <td className="p-5">
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                   {sub.plan.replace('_', ' ')}
                                </span>
                             </td>
                             <td className="p-5 text-right font-black text-slate-900 text-sm">
                                Rs. {sub.amountPkr.toLocaleString()}
                             </td>
                          </tr>
                        ))}
                        {stats?.recentPayments?.length === 0 && (
                          <tr>
                             <td colSpan="4" className="p-20 text-center text-slate-400 font-medium italic">
                                No recent payments recorded.
                             </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Plan Distribution */}
         <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
               <Activity className="w-5 h-5 text-emerald-400" /> Plan Distribution
            </h3>
            
            <div className="space-y-6">
               {[
                 { label: "Student Monthly", count: "64%", color: "bg-blue-500" },
                 { label: "Student Yearly", count: "22%", color: "bg-emerald-500" },
                 { label: "Institution Plan", count: "8%", color: "bg-purple-500" },
                 { label: "Others", count: "6%", color: "bg-slate-500" }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>{item.label}</span>
                       <span className="text-white">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${item.color}`} style={{ width: item.count }} />
                    </div>
                 </div>
               ))}

               <div className="pt-8 mt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-sm font-bold">Projected Next Month</p>
                     <p className="text-emerald-400 font-black">+Rs. 12,400</p>
                  </div>
                  <button className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                     View Projections
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
