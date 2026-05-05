import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { McqManagementList } from "@/components/dashboard/McqManagementList"
import { AiExplanationView } from "@/components/dashboard/AiExplanationView"
import { 
  ChevronLeft, 
  BookOpen, 
  Calendar, 
  User, 
  FileText 
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function McqReviewPage({ params }) {
  const { uploadId } = params
  const session = await auth()
  
  if (!session) redirect("/auth/login")

  const upload = await db.textbookUpload.findUnique({
    where: { id: uploadId },
    include: {
      subject: true,
      chapter: true,
      uploadedBy: true,
      mcqs: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!upload) notFound()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/content" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-teal-600 transition-colors w-fit">
          <ChevronLeft className="h-4 w-4" />
          Back to Content Management
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
              Review Generated MCQs
            </h1>
            <p className="text-zinc-500">
              Review and approve questions generated from <span className="font-semibold text-teal-700">{upload.originalName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="p-4 rounded-xl bg-white border border-teal-50 shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Subject</p>
            <p className="text-sm font-bold text-teal-900">{upload.subject?.name || 'N/A'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-teal-50 shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Chapter</p>
            <p className="text-sm font-bold text-teal-900">{upload.chapter?.name || 'N/A'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-teal-50 shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Uploaded By</p>
            <p className="text-sm font-bold text-teal-900">{upload.uploadedBy?.name || 'Admin'}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-teal-50 shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Date</p>
            <p className="text-sm font-bold text-teal-900">{new Date(upload.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <AiExplanationView explanation={upload.aiExplanation} />

      <McqManagementList 
        initialMcqs={upload.mcqs} 
        uploadId={upload.id} 
      />
    </div>
  )
}
