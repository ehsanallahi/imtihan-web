import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, GraduationCap, ArrowRight } from "lucide-react";

export default async function StudyDashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch student profile
  const profile = await db.studentProfile.findUnique({
    where: { userId: session.user.id }
  });

  // For this MVP, if they don't have a profile with grade/board, 
  // we'll just show all active subjects. In a full app, we'd prompt them to set it up.
  const query = { isActive: true };
  if (profile?.grade && profile?.board) {
    query.grade = profile.grade;
    query.board = profile.board;
  }

  // Fetch subjects with counts
  const subjects = await db.subject.findMany({
    where: query,
    include: {
      _count: {
        select: { chapters: true, mcqs: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Calculate some basic stats
  const totalChapters = subjects.reduce((acc, sub) => acc + sub._count.chapters, 0);
  const totalMcqs = subjects.reduce((acc, sub) => acc + sub._count.mcqs, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome & Stats Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-950 sm:text-4xl mb-2">
          Welcome to Your Study Area
        </h1>
        <p className="text-zinc-600 text-lg mb-8 max-w-2xl">
          Pick up where you left off or start a new chapter. You have {totalMcqs} practice questions available across {subjects.length} subjects.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card className="border-none shadow-sm bg-teal-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-teal-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Available Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-teal-900">{subjects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-indigo-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Total Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-900">{totalChapters}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-emerald-50/50 sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Practice Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-900">{totalMcqs}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold text-teal-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" />
          Your Subjects
        </h2>
        
        {subjects.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-teal-100 rounded-xl bg-teal-50/30">
            <h3 className="text-lg font-medium text-teal-900 mb-1">No subjects found</h3>
            <p className="text-zinc-500">There are no active subjects available for your grade and board right now.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="group hover:shadow-md transition-all duration-300 border-teal-100/50 overflow-hidden flex flex-col">
                <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400" />
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-teal-950 group-hover:text-teal-700 transition-colors">
                    {subject.name}
                  </CardTitle>
                  {subject.nameUrdu && (
                    <CardDescription className="text-sm sm:text-base font-urdu text-right" dir="rtl">
                      {subject.nameUrdu}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 flex-1">
                  <div className="flex flex-col gap-2 text-sm text-zinc-600">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                      <span>Chapters</span>
                      <span className="font-semibold text-teal-900">{subject._count.chapters}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                      <span>MCQs</span>
                      <span className="font-semibold text-teal-900">{subject._count.mcqs}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-4 border-t border-slate-100">
                  <Link href={`/study/subject/${subject.id}`} className="w-full">
                    <Button className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 transition-colors border-none shadow-none group-hover:bg-teal-600 group-hover:text-white">
                      Study Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
