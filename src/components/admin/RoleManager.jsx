"use client";

import { useState } from "react";
import { updateUserRole } from "@/actions/adminActions";
import { Settings2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  "super_admin",
  "finance_manager",
  "content_editor",
  "moderator",
  "marketer",
  "support_agent",
  "institution_admin",
  "teacher",
  "student"
];

export default function RoleManager({ userId, currentRole }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = async (newRole) => {
    if (newRole === currentRole) return;
    
    try {
      setLoading(true);
      const res = await updateUserRole(userId, newRole);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Role updated successfully");
      setIsOpen(false);
      window.location.reload(); // Refresh to reflect changes
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60] animate-in fade-in zoom-in duration-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">
             Select New Role
           </p>
           <div className="space-y-1 max-h-60 overflow-auto">
             {ROLES.map((role) => (
               <button
                 key={role}
                 disabled={loading}
                 onClick={() => handleRoleChange(role)}
                 className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                   currentRole === role 
                     ? "bg-indigo-50 text-indigo-700" 
                     : "text-slate-600 hover:bg-slate-50"
                 }`}
               >
                 <span className="capitalize">{role.replace('_', ' ')}</span>
                 {currentRole === role && <Check className="w-3 h-3" />}
                 {loading && currentRole !== role && <Loader2 className="w-3 h-3 animate-spin opacity-0 group-hover:opacity-100" />}
               </button>
             ))}
           </div>
        </div>
      )}
      
      {/* Click outside backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
