"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { verifyTeacher } from "@/actions/adminActions";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TeacherVerificationModal({ teacherId, teacherName, isVerified }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await verifyTeacher(teacherId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`${teacherName} has been verified successfully!`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to verify teacher.");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
        <ShieldCheck className="w-3.5 h-3.5" /> Verified
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl font-bold border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700 h-9 px-4">
          Verify Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Verify Educator</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Are you sure you want to verify <span className="font-black text-slate-900">{teacherName}</span>? 
            This will grant them full access to contribute MCQ content and manage students.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 my-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
            Please ensure you have reviewed their educational credentials and institutional affiliation before proceeding.
          </p>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={loading}
            className="rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
