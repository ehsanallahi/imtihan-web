"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ImpersonationBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();

  if (!session?.user?.isImpersonating) return null;

  const handleStopImpersonating = async () => {
    try {
      toast.info("Stopping impersonation...");
      
      await update({
        stopImpersonating: true
      });

      router.push("/admin/students/" + session.user.id);
      router.refresh();
      toast.success("Returned to admin view");
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
      toast.error("Failed to return to admin view");
    }
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-md border-b border-amber-600">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-1 rounded-lg">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <p className="text-xs font-black uppercase tracking-wider">
          Currently Impersonating: <span className="underline">{session.user.name}</span> ({session.user.email})
        </p>
      </div>
      
      <button 
        onClick={handleStopImpersonating}
        className="flex items-center gap-2 bg-white text-amber-600 px-3 py-1 rounded-lg font-black text-[10px] uppercase hover:bg-amber-50 transition-all shadow-sm active:scale-95"
      >
        <LogOut className="w-3 h-3" /> Stop Impersonating
      </button>
    </div>
  );
}
