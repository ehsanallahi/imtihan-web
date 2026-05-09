"use client";

import { useState, useTransition } from "react";
import { broadcastNotification } from "@/actions/adminActions";
import { 
  Send, 
  Megaphone, 
  Users, 
  AlertCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function BroadcastForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await broadcastNotification(formData);
      if (result.success) {
        toast.success(`Successfully broadcasted to ${result.count} users!`);
        setFormData({ title: "", message: "" });
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
           <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Megaphone className="w-5 h-5 text-teal-600" />
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Create Announcement</h3>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notification Title</label>
                 <input 
                   required
                   type="text"
                   placeholder="e.g., New Past Papers Available!"
                   className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-bold text-slate-900"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Message</label>
                 <textarea 
                   required
                   placeholder="Enter the message you want all students to see..."
                   className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium text-slate-600 min-h-[150px]"
                   value={formData.message}
                   onChange={(e) => setFormData({...formData, message: e.target.value})}
                 />
              </div>
           </div>

           <div className="pt-4">
              <button 
                disabled={isPending}
                className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {isPending ? "Broadcasting..." : <><Send className="w-4 h-4" /> Send Announcement</>}
              </button>
           </div>
        </div>
      </form>

      {/* Preview Section */}
      <div className="space-y-6">
         <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
               <AlertCircle className="w-5 h-5 text-teal-400" />
               <h3 className="font-black uppercase tracking-tight">Real-time Preview</h3>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black uppercase text-teal-400">System Notification</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/30">Just now</span>
               </div>
               
               <div className="space-y-2">
                  <p className="text-lg font-black text-white">{formData.title || "Your Title Here"}</p>
                  <p className="text-sm font-medium text-white/60 leading-relaxed">
                     {formData.message || "Your announcement message will appear here. Students will receive this notification in their dashboard immediately."}
                  </p>
               </div>
            </div>

            <div className="mt-12 space-y-4">
               <div className="flex items-center gap-3 text-white/40">
                  <Users className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Targets: All Active Students</p>
               </div>
               <div className="flex items-center gap-3 text-white/40">
                  <Clock className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Delivery: Instant Broadcast</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
