import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Lock, Calendar, Award, ArrowLeft, RefreshCcw } from "lucide-react";
import { checkUserSubscription } from "@/actions/subscriptionActions";
import { PastPaperMcqBank } from "@/components/past-papers/PastPaperMcqBank";

export const metadata = {
  title: "Past Paper MCQ Bank | Imtihan",
  description: "Browse and practice MCQs from past papers, filtered by board, subject, class, and medium.",
};

export default async function PastPapersPage({ searchParams }) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { isPremium } = await checkUserSubscription();

  let profile = null;
  if (session?.user?.id) {
    profile = await db.studentProfile.findUnique({ where: { userId: session.user.id } });
  }

  // Filters from URL search params
  const filterBoard = searchParams?.board || "";
  const filterGrade = searchParams?.grade || (profile?.grade || "");
  const filterSubjectId = searchParams?.subject || "";
  const filterMedium = searchParams?.medium || "";
  const sortBy = searchParams?.sort || "repeated"; // "repeated" | "newest"

  // Build where clause (canonical MCQs only, approved)
  const where = {
    canonicalId: null,  // only show canonical (unique) questions
    isApproved: true,
    ...(filterBoard && { board: filterBoard }),
    ...(filterGrade && { grade: filterGrade }),
    ...(filterSubjectId && { subjectId: filterSubjectId }),
    ...(filterMedium && { medium: filterMedium }),
  };

  const [mcqs, subjects] = await Promise.all([
    db.pastPaperMCQ.findMany({
      where,
      include: { subject: { select: { name: true } } },
      orderBy: sortBy === "repeated" ? { repeatCount: "desc" } : { year: "desc" },
      take: 100, // paginate later
    }),
    db.subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  // Check if the new MCQ bank has data; fall back to old PDF view if not
  const hasMcqBank = mcqs.length > 0 || (await db.pastPaperMCQ.count()) > 0;

  // Legacy PDF past papers (keep for backward compat)
  const legacyPapers = await db.pastPaper.findMany({
    include: { subject: { select: { name: true } } },
    orderBy: [{ year: "desc" }, { subject: { name: "asc" } }],
    take: 20,
  });

  const gradeLabel = { nine: "Grade 9", ten: "Grade 10", eleven: "Grade 11", twelve: "Grade 12" };
  const boardLabel = { punjab: "Punjab", sindh: "Sindh", kpk: "KPK", federal: "Federal", aku: "AKU", private: "Private" };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8">
        <Link href="/study" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Study
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-teal-950">Past Paper MCQ Bank</h1>
            <p className="text-zinc-500 mt-1">
              {profile?.grade && profile?.board
                ? `${gradeLabel[profile.grade]} — ${boardLabel[profile.board]} Board`
                : "Browse questions from past exam papers"}
            </p>
          </div>
          {!profile?.grade && (
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                Set Grade & Board
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Premium gate */}
      {!isPremium && (
        <div className="mb-8 p-6 rounded-2xl border-2 border-amber-200 bg-amber-50 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900">Premium Feature</h3>
            <p className="text-sm text-amber-700">Past paper MCQ bank is available for Super subscribers. Upgrade to unlock filtering, repeat stats, and practice mode.</p>
          </div>
          <Link href="/pricing">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold flex-shrink-0">Upgrade to Super</Button>
          </Link>
        </div>
      )}

      {/* MCQ Bank (premium or public preview) */}
      {hasMcqBank ? (
        <PastPaperMcqBank
          mcqs={mcqs}
          subjects={subjects}
          filters={{ board: filterBoard, grade: filterGrade, subjectId: filterSubjectId, medium: filterMedium, sort: sortBy }}
          isPremium={isPremium}
          boardLabel={boardLabel}
          gradeLabel={gradeLabel}
        />
      ) : (
        /* Fallback: Legacy PDF download list */
        <>
          <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-100 text-sm text-teal-700">
            📋 MCQ bank is being built. Below are downloadable past paper PDFs in the meantime.
          </div>
          {legacyPapers.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
              <FileText className="w-12 h-12 text-teal-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-teal-900 mb-1">No past papers available</h3>
              <p className="text-zinc-500">No papers have been uploaded yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {legacyPapers.map((paper) => (
                <Card key={paper.id} className="group hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 bg-teal-50 rounded-lg">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {paper.isPremium && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Premium</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{boardLabel[paper.board] || paper.board}</Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-teal-950 group-hover:text-teal-700 transition-colors mb-1">{paper.title}</h3>
                    <p className="text-sm text-zinc-500 mb-4">{paper.subject?.name}</p>
                    {paper.totalMarks && (
                      <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Total Marks: {paper.totalMarks}
                      </p>
                    )}
                    {isPremium || !paper.isPremium ? (
                      <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                          <Download className="w-4 h-4 mr-2" /> View / Download
                        </Button>
                      </a>
                    ) : (
                      <Link href="/pricing" className="block w-full">
                        <Button className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200" size="sm">
                          <Lock className="w-4 h-4 mr-2" /> Unlock with Super
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
