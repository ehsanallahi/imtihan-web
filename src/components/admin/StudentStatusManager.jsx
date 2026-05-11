"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toggleUserStatus } from "@/actions/adminActions";
import { useRouter } from "next/navigation";

export default function StudentStatusManager({ studentId, initialStatus }) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (!confirm(`Are you sure you want to ${isActive ? 'suspend' : 'activate'} this account?`)) return;
    
    setIsLoading(true);
    try {
      const result = await toggleUserStatus(studentId);
      if (result.success) {
        setIsActive(result.isActive);
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
      <h3 className="font-black text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4">
        <ShieldCheck className="w-5 h-5 text-teal-600" /> Account Status
      </h3>
      
      <div className="space-y-4">
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          isActive 
            ? "bg-emerald-50 border-emerald-100" 
            : "bg-red-50 border-red-100"
        }`}>
          <div>
            <p={`text-xs font-black uppercase ${isActive ? "text-emerald-900" : "text-red-900"}`}>Status</p>
            <p className={`text-sm font-bold ${isActive ? "text-emerald-700" : "text-red-700"}`}>
              {isActive ? "Active Account" : "Suspended"}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">Verification</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">User ID</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">{studentId.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl border font-black text-sm transition-all flex items-center justify-center gap-2 ${
            isActive 
              ? "border-red-100 text-red-600 hover:bg-red-50" 
              : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            isActive ? "Suspend Account" : "Activate Account"
          )}
        </button>
      </div>
    </div>
  );
}
