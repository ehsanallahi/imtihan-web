import BroadcastForm from "@/components/admin/BroadcastForm";
import { Megaphone, History, Clock, User, Info } from "lucide-react";
import { getBroadcastHistory } from "@/actions/adminActions";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const { data: history, error } = await getBroadcastHistory();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
           Global Announcements <Megaphone className="w-8 h-8 text-teal-600" />
        </h1>
        <p className="text-slate-500 font-medium italic">Broadcast important updates and alerts to every student on the platform.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
         {/* Left: Broadcast Form */}
         <div className="lg:col-span-2">
            <BroadcastForm />
         </div>

         {/* Right: Broadcast History */}
         <div className="space-y-6">
            <div className="flex items-center gap-3">
               <History className="w-5 h-5 text-teal-600" />
               <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Broadcasts</h3>
            </div>

            <div className="space-y-4">
               {history?.map((log) => (
                 <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-100 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                             <Megaphone className="w-3 h-3 text-teal-600" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {format(new Date(log.createdAt), "MMM d, HH:mm")}
                          </span>
                       </div>
                       <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
                          Sent to {log.details?.targetCount || 0}
                       </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{log.details?.title}</h4>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                          {log.user?.name?.[0]}
                       </div>
                       <span className="text-[10px] font-bold text-slate-400">By {log.user?.name}</span>
                    </div>
                 </div>
               ))}
               
               {history?.length === 0 && (
                 <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Megaphone className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No previous broadcasts</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
