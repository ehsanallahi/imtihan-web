import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Lock, Calendar, Award, ArrowLeft } from "lucide-react";
import { checkUserSubscription } from "@/actions/subscriptionActions";

export default async function PastPapersPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { isPremium } = await checkUserSubscription();
  let profile = null;
  if (session?.user?.id) {
    profile = await db.studentProfile.findUnique({ where: { userId: session.user.id } });
  }

  const where = {};
  if (profile?.grade) where.grade = profile.grade;
  if (profile?.board) where.board = profile.board;

  const papers = await db.pastPaper.findMany({
    where,
    include: { subject: { select: { name: true } } },
    orderBy: [{ year: "desc" }, { subject: { name: "asc" } }],
  });

  const gradeLabel = { nine: "Grade 9", ten: "Grade 10", eleven: "Grade 11", twelve: "Grade 12" };
  const boardLabel = { punjab: "Punjab", sindh: "Sindh", kpk: "KPK", federal: "Federal", aku: "AKU", private: "Private" };

  // Group by year
  const byYear = papers.reduce((acc, p) => {
    if (!acc[p.year]) acc[p.year] = [];
    acc[p.year].push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link href="/study" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Study
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-teal-950">Past Papers</h1>
            <p className="text-zinc-500 mt-1">
              {profile?.grade && profile?.board
                ? `${gradeLabel[profile.grade]} — ${boardLabel[profile.board]} Board`
                : "All available past papers"}
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

      {!isPremium && (
        <div className="mb-8 p-6 rounded-2xl border-2 border-amber-200 bg-amber-50 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900">Premium Feature</h3>
            <p className="text-sm text-amber-700">Past papers are available exclusively for Super subscribers.</p>
          </div>
          <Link href="/pricing">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold flex-shrink-0">Upgrade to Super</Button>
          </Link>
        </div>
      )}

      {papers.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
          <FileText className="w-12 h-12 text-teal-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-teal-900 mb-1">No past papers available</h3>
          <p className="text-zinc-500">No papers have been uploaded yet for your grade and board.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(byYear).sort((a, b) => b - a).map((year) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-teal-500" />
                <h2 className="text-xl font-display font-bold text-teal-900">{year}</h2>
                <div className="flex-1 h-px bg-teal-100" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byYear[year].map((paper) => (
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
                      <h3 className="font-bold text-teal-950 group-hover:text-teal-700 transition-colors mb-1">
                        {paper.title}
                      </h3>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
