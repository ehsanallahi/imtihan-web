"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInstitution } from "@/actions/adminActions";
import { School, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InstitutionForm() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      address: formData.get("address"),
      contact: formData.get("contact"),
    };

    try {
      setLoading(true);
      const res = await createInstitution(data);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Institution added successfully!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create institution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Institution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <School className="w-6 h-6 text-teal-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">New Institution</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400">Institution Name</Label>
              <Input id="name" name="name" placeholder="e.g. Beaconhouse School System" required className="rounded-xl border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[10px] font-black uppercase text-slate-400">City (Optional)</Label>
              <Input id="address" name="address" placeholder="e.g. Lahore, Karachi" className="rounded-xl border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-[10px] font-black uppercase text-slate-400">Contact Number</Label>
              <Input id="contact" name="contact" placeholder="+92 XXX XXXXXXX" className="rounded-xl border-slate-200" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Institution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
