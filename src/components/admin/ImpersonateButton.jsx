"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { impersonateUser } from "@/actions/adminActions";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImpersonateButton({ userId }) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    try {
      setLoading(true);
      const res = await impersonateUser(userId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Impersonating ${res.data.name}...`);

      // Update the session via NextAuth client-side update
      await update({
        impersonating: true,
        targetUser: res.data
      });

      // Redirect to the student's dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Impersonation failed:", error);
      toast.error("Something went wrong during impersonation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <BookOpen className="w-4 h-4" />
      )}
      Impersonate Student
    </button>
  );
}
