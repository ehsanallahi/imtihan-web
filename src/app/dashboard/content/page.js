import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { UploadCard } from "@/components/cms/UploadCard"
import { StatusBadge } from "@/components/cms/StatusBadge"
import { GenerateMcqsButton } from "@/components/dashboard/GenerateMcqsButton"
import { FileText, Database, Layers } from "lucide-react"

export default async function ContentManagementPage() {
  const session = await auth()
  
  // Extra security check for the route
  const allowedRoles = ["super_admin", "content_editor", "moderator"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect("/dashboard")
  }

  // Fetch subjects and chapters for the upload form
  const [subjects, chapters, uploads] = await Promise.all([
    db.subject.findMany({ orderBy: { name: 'asc' } }),
    db.chapter.findMany({ orderBy: { number: 'asc' } }),
    db.textbookUpload.findMany({
      include: {
        subject: true,
        chapter: true,
        _count: {
          select: { mcqs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
            Content Management
          </h1>
          <p className="text-zinc-500">
            Manage textbook uploads and trigger AI question generation for your subjects.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display font-bold text-teal-900">Upload Textbook</CardTitle>
              <CardDescription>Upload a chapter PDF to start generating MCQs.</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadCard 
                subjects={subjects} 
                chapters={chapters} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-teal-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Total Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{uploads.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <Database className="h-4 w-4" /> Generated MCQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {uploads.reduce((acc, curr) => acc + curr._count.mcqs, 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gold-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gold-700 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Pending Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-900">
              {uploads.filter(u => !u.mcqsGenerated).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display font-bold text-teal-900">Textbook Uploads</CardTitle>
          <CardDescription>A list of all chapters uploaded to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-teal-50">
                <TableHead className="w-[300px]">Original Filename</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead className="text-center">MCQ Count</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-zinc-400">
                    No textbook uploads found. Start by uploading a PDF.
                  </TableCell>
                </TableRow>
              ) : (
                uploads.map((upload) => (
                  <TableRow key={upload.id} className="border-teal-50/50 hover:bg-teal-50/20 transition-colors">
                    <TableCell className="font-medium text-teal-950 truncate max-w-[300px]">
                      {upload.originalName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100 font-normal">
                        {upload.subject?.name || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-600">
                        {upload.chapter?.name || `CH-${upload.chapterId?.slice(-4)}` || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-teal-900">{upload._count.mcqs}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={upload.mcqsGenerated ? "COMPLETED" : "PENDING"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <GenerateMcqsButton 
                        uploadId={upload.id} 
                        isGenerated={upload.mcqsGenerated} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
