"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Play, 
  Pencil, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BOARD_OPTIONS = [
  { value: "punjab", label: "Punjab" },
  { value: "sindh", label: "Sindh" },
  { value: "kpk", label: "KPK" },
  { value: "federal", label: "Federal" },
  { value: "aku", label: "AKU" },
  { value: "private", label: "Private" },
];

const GRADE_OPTIONS = [
  { value: "nine", label: "Grade 9" },
  { value: "ten", label: "Grade 10" },
  { value: "eleven", label: "Grade 11" },
  { value: "twelve", label: "Grade 12" },
];

export function PastPaperTableActions({ upload, subjects }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [editData, setEditData] = useState({
    board: upload.board,
    grade: upload.grade,
    year: upload.year.toString(),
    medium: upload.medium,
    subjectId: upload.subjectId,
  });

  const handleProcess = async () => {
    setIsProcessing(true);
    const promise = fetch("/api/past-paper/process", {
      method: "POST",
      body: JSON.stringify({ uploadId: upload.id }),
      headers: { "Content-Type": "application/json" },
    });

    toast.promise(promise, {
      loading: "AI is extracting MCQs...",
      success: (res) => {
        if (!res.ok) throw new Error("Processing failed");
        setIsProcessing(false);
        router.refresh();
        return "Processing complete!";
      },
      error: (err) => {
        setIsProcessing(false);
        return err.message;
      },
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete the PDF and all extracted MCQs.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/past-paper/upload/${upload.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Past paper deleted");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/past-paper/upload/${upload.id}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Metadata updated");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-teal-600">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!upload.isProcessed && (
            <DropdownMenuItem 
              onClick={handleProcess} 
              disabled={isProcessing}
              className="text-teal-600 focus:text-teal-600 focus:bg-teal-50"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Process Now
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Metadata
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Paper
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-teal-900">Edit Metadata</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="board">Board</Label>
              <Select 
                value={editData.board} 
                onValueChange={(v) => setEditData(d => ({ ...d, board: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade</Label>
                <Select 
                  value={editData.grade} 
                  onValueChange={(v) => setEditData(d => ({ ...d, grade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  type="number" 
                  value={editData.year}
                  onChange={(e) => setEditData(d => ({ ...d, year: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={editData.subjectId} 
                onValueChange={(v) => setEditData(d => ({ ...d, subjectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} (Grade {s.grade})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medium">Medium</Label>
              <Select 
                value={editData.medium} 
                onValueChange={(v) => setEditData(d => ({ ...d, medium: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleUpdate}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
