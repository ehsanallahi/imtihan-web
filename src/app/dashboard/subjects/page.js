import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Layers, BrainCircuit } from "lucide-react";

export default async function DashboardSubjectsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const profile = await db.studentProfile.findUnique({ where: { userId: session.user.id } });

  const query = { isActive: true };
  if (profile?.grade && profile?.board) {
    query.grade = profile.grade;
    query.board = profile.board;
  }

  const subjects = await db.subject.findMany({
    where: query,
    include: { _count: { select: { chapters: true, mcqs: true } } },
    orderBy: { name: "asc" },
  });

  const gradeLabel = { nine: "Grade 9", ten: "Grade 10", eleven: "Grade 11", twelve: "Grade 12" };
  const boardLabel = { punjab: "Punjab", sindh: "Sindh", kpk: "KPK", federal: "Federal", aku: "AKU", private: "Private" };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900">My Subjects</h1>
          <p className="text-zinc-500 mt-1">
            {profile?.grade && profile?.board
              ? `Showing subjects for ${gradeLabel[profile.grade]} — ${boardLabel[profile.board]} Board`
              : "Showing all available subjects"}
          </p>
        </div>
        {(!profile?.grade || !profile?.board) && (
          <Link href="/dashboard/settings">
            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
              Set Grade & Board →
            </Button>
          </Link>
        )}
      </div>

      {subjects.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
          <BookOpen className="w-12 h-12 text-teal-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-teal-900 mb-1">No subjects found</h3>
          <p className="text-zinc-500">No active subjects are available for your grade and board.</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="group hover:shadow-md transition-all duration-300 border-teal-100/50 overflow-hidden flex flex-col">
              <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400" />
              <CardHeader className="p-5">
                <CardTitle className="text-lg font-bold text-teal-950 group-hover:text-teal-700 transition-colors">
                  {subject.name}
                </CardTitle>
                {subject.nameUrdu && (
                  <p className="text-sm font-urdu text-right text-zinc-500" dir="rtl">{subject.nameUrdu}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 px-5 pb-0">
                <div className="flex gap-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-teal-400" />{subject._count.chapters} chapters</span>
                  <span className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4 text-emerald-400" />{subject._count.mcqs} MCQs</span>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-4">
                <Link href={`/study/subject/${subject.id}`} className="w-full">
                  <Button className="w-full bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-colors">
                    Study Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
