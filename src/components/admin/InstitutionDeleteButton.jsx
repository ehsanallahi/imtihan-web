"use client";

import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteInstitution } from "@/actions/adminActions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InstitutionDeleteButton({ id, name }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteInstitution(id);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Institution deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete institution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all">
          <Trash2 className="w-5 h-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black">Delete Institution?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-bold text-slate-900">{name}</span>? 
            This action cannot be undone and may affect associated teacher profiles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
