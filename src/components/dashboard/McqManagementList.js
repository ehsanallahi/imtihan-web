'use client'

import { useState } from 'react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Trash2, 
  Save, 
  ChevronRight, 
  FileCheck, 
  Languages, 
  AlertCircle 
} from "lucide-react"
import { toast } from "sonner"
import { 
  updateMcqAction, 
  approveMcqAction, 
  deleteMcqAction, 
  bulkApproveMcqsAction 
} from "@/actions/mcqActions"

export function McqManagementList({ initialMcqs, uploadId }) {
  const [mcqs, setMcqs] = useState(initialMcqs)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (id, data) => {
    setIsLoading(true)
    const result = await updateMcqAction(id, data)
    if (result.success) {
      toast.success("MCQ updated successfully")
      setEditingId(null)
      setMcqs(mcqs.map(m => m.id === id ? { ...m, ...data } : m))
    } else {
      toast.error(result.error || "Failed to update MCQ")
    }
    setIsLoading(false)
  }

  const handleApprove = async (id, isApproved) => {
    const result = await approveMcqAction(id, isApproved)
    if (result.success) {
      setMcqs(mcqs.map(m => m.id === id ? { ...m, isApproved } : m))
      toast.success(isApproved ? "MCQ approved" : "Approval removed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this MCQ?")) return
    const result = await deleteMcqAction(id)
    if (result.success) {
      setMcqs(mcqs.filter(m => m.id !== id))
      toast.success("MCQ deleted")
    }
  }

  const handleBulkApprove = async () => {
    setIsLoading(true)
    const result = await bulkApproveMcqsAction(uploadId)
    if (result.success) {
      setMcqs(mcqs.map(m => ({ ...m, isApproved: true })))
      toast.success("All MCQs approved")
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-teal-900">Generated MCQs ({mcqs.length})</h2>
        <Button 
          onClick={handleBulkApprove} 
          disabled={isLoading || mcqs.every(m => m.isApproved)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <FileCheck className="h-4 w-4" />
          Bulk Approve All
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4 border-none">
        {mcqs.map((mcq, index) => (
          <AccordionItem 
            key={mcq.id} 
            value={mcq.id}
            className="border rounded-xl bg-white shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4 text-left w-full">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate pr-4">
                    {mcq.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-4">
                      {mcq.difficulty}
                    </Badge>
                    {mcq.isApproved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] h-4">Approved</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] h-4">Pending Review</Badge>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* English Version */}
                <div className="space-y-4 border-r pr-6 border-zinc-100">
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-widest">
                    <Languages className="h-3 w-3" /> English
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-zinc-400">Question</Label>
                      <Textarea 
                        defaultValue={mcq.question}
                        onChange={(e) => mcq.question = e.target.value}
                        className="mt-1 min-h-[80px] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-zinc-400">Option A</Label>
                        <Input defaultValue={mcq.optionA} onChange={(e) => mcq.optionA = e.target.value} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">Option B</Label>
                        <Input defaultValue={mcq.optionB} onChange={(e) => mcq.optionB = e.target.value} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">Option C</Label>
                        <Input defaultValue={mcq.optionC} onChange={(e) => mcq.optionC = e.target.value} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">Option D</Label>
                        <Input defaultValue={mcq.optionD} onChange={(e) => mcq.optionD = e.target.value} className="h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Urdu Version */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-widest justify-end">
                    اردو <Languages className="h-3 w-3" />
                  </div>
                  <div className="space-y-4 text-right" dir="rtl">
                    <div>
                      <Label className="text-xs text-zinc-400">سوال</Label>
                      <Textarea 
                        defaultValue={mcq.questionUrdu}
                        onChange={(e) => mcq.questionUrdu = e.target.value}
                        className="mt-1 min-h-[80px] text-lg font-urdu leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-zinc-400">آپشن A</Label>
                        <Input defaultValue={mcq.optionA} onChange={(e) => mcq.optionA = e.target.value} className="h-10 text-lg font-urdu" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">آپشن B</Label>
                        <Input defaultValue={mcq.optionB} onChange={(e) => mcq.optionB = e.target.value} className="h-10 text-lg font-urdu" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">آپشن C</Label>
                        <Input defaultValue={mcq.optionC} onChange={(e) => mcq.optionC = e.target.value} className="h-10 text-lg font-urdu" />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">آپشن D</Label>
                        <Input defaultValue={mcq.optionD} onChange={(e) => mcq.optionD = e.target.value} className="h-10 text-lg font-urdu" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold text-zinc-500">Correct:</Label>
                    <select 
                      defaultValue={mcq.correctAnswer} 
                      onChange={(e) => mcq.correctAnswer = e.target.value}
                      className="h-8 rounded border border-zinc-200 px-2 text-xs font-bold bg-teal-50 text-teal-900"
                    >
                      {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`approve-${mcq.id}`} 
                      checked={mcq.isApproved}
                      onCheckedChange={(val) => handleApprove(mcq.id, val)}
                    />
                    <Label htmlFor={`approve-${mcq.id}`} className="text-xs font-medium cursor-pointer">Approved</Label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(mcq.id)}
                    className="text-zinc-400 hover:text-crimson-600 hover:bg-crimson-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleUpdate(mcq.id, mcq)}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
