import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { resolveMcqReport, dismissMcqReport } from "@/actions/adminActions";

export const dynamic = 'force-dynamic';

export default async function McqAuditPage() {
  const reports = await db.mCQReport.findMany({
    include: {
      mcq: {
        include: { chapter: true, subject: true }
      },
      student: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">MCQ Quality Audit</h1>
          <p className="text-slate-500">Review student reports and verify question accuracy.</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 border border-amber-200">
          <AlertTriangle className="w-4 h-4" />
          {reports.filter(r => r.status === 'pending').length} Active Reports
        </div>
      </div>

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <p className="text-slate-400 font-medium">No reports found. High five for quality! 🙌</p>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className={`border-l-4 ${report.status === 'pending' ? 'border-l-amber-500' : 'border-l-slate-200'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      Report #{report.id.slice(-6).toUpperCase()}
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                        {report.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-medium">
                      Reported by <span className="text-slate-900">{report.student.name}</span> • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'pending' && (
                      <>
                        <form action={async () => {
                          'use server'
                          await resolveMcqReport(report.id)
                        }}>
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1 font-bold h-8">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolve
                          </Button>
                        </form>
                        <form action={async () => {
                          'use server'
                          await dismissMcqReport(report.id)
                        }}>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 gap-1 font-bold h-8">
                            <Trash2 className="w-3.5 h-3.5" /> Dismiss
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-white">{report.reason}</Badge>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {report.mcq.subject.name} • {report.mcq.chapter.name}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Q: {report.mcq.question}</p>
                  <p className="text-xs text-emerald-600 font-black mt-1 uppercase">Correct: {report.mcq.correctAnswer}</p>
                  {report.details && (
                    <div className="mt-3 p-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-100">
                      <span className="font-bold">Student Note:</span> {report.details}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
