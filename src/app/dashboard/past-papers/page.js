import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PastPaperUploadCard } from "@/components/past-papers/PastPaperUploadCard";
import { PastPaperTableActions } from "@/components/past-papers/PastPaperTableActions";
import { FileText, Database, Clock, CheckCircle2 } from "lucide-react";

const BOARD_LABELS = { punjab: "Punjab", sindh: "Sindh", kpk: "KPK", federal: "Federal", aku: "AKU", private: "Private" };
const GRADE_LABELS = { nine: "9", ten: "10", eleven: "11", twelve: "12" };
const MEDIUM_COLORS = { english: "bg-blue-50 text-blue-700 border-blue-200", urdu: "bg-purple-50 text-purple-700 border-purple-200" };

export const metadata = {
  title: "Past Paper MCQ Bank | Admin — Imtihan",
  description: "Upload and manage past papers for AI-powered MCQ extraction.",
};

export default async function AdminPastPapersPage() {
  const session = await auth();
  const allowedRoles = ["super_admin", "content_editor", "moderator"];
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const [subjects, uploads] = await Promise.all([
    db.subject.findMany({ orderBy: { name: "asc" } }),
    db.pastPaperUpload.findMany({
      include: {
        subject: { select: { name: true } },
        _count: { select: { mcqs: { where: { canonicalId: null } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalMcqs = uploads.reduce((acc, u) => acc + u._count.mcqs, 0);
  const processedCount = uploads.filter(u => u.isProcessed).length;
  const pendingCount = uploads.length - processedCount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
          Past Paper MCQ Bank
        </h1>
        <p className="text-zinc-500 mt-1">
          Upload past papers — AI extracts MCQs, detects metadata, and tracks repeated questions automatically.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display font-bold text-teal-900">Upload Past Paper</CardTitle>
              <CardDescription>PDF file or direct URL. AI auto-detects board, grade, year & medium.</CardDescription>
            </CardHeader>
            <CardContent>
              <PastPaperUploadCard subjects={subjects} />
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
                  <Database className="h-4 w-4" /> Unique MCQs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{totalMcqs}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">{pendingCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold text-teal-900">Uploaded Past Papers</CardTitle>
              <CardDescription>All past paper PDFs uploaded to the platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-teal-50">
                      <TableHead className="min-w-[200px]">File</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Medium</TableHead>
                      <TableHead className="text-center">MCQs</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-zinc-400">
                          No past papers uploaded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      uploads.map((upload) => (
                        <TableRow key={upload.id} className="border-teal-50/50 hover:bg-teal-50/20 transition-colors">
                          <TableCell className="font-medium text-teal-950">
                            <a
                              href={upload.cloudinaryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-teal-600 transition-colors flex items-center gap-1.5"
                              title={upload.originalName}
                            >
                              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{upload.originalName}</span>
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-700 border-teal-100">
                                {BOARD_LABELS[upload.board] || upload.board}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                G{GRADE_LABELS[upload.grade] || upload.grade}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] text-zinc-500">
                                {upload.year}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-zinc-600 truncate max-w-[100px] block">
                              {upload.subject?.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] ${MEDIUM_COLORS[upload.medium] || ""}`}>
                              {upload.medium === "urdu" ? "اردو" : "English"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-sm text-teal-900">{upload._count.mcqs}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {upload.isProcessed ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                <Clock className="w-2.5 h-2.5" /> Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <PastPaperTableActions upload={upload} subjects={subjects} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
