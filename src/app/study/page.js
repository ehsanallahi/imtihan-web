import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, GraduationCap, ArrowRight, CreditCard, Sparkles, Shield, MessageSquare, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllSubjectsProgress } from "@/actions/progressActions";
import { Progress } from "@/components/ui/progress";
import ReferralWidget from "@/components/study/ReferralWidget";

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

  // Fetch Subject Progress
  const progressRes = await getAllSubjectsProgress();
  const subjectProgress = progressRes.success ? progressRes.progress : {};

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

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

          <Card className="border-none shadow-sm bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Practice Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-900">{totalMcqs}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(session.user.role === 'premium_student' || session.user.role === 'super_admin') ? (
                  <>
                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-500 border-none font-black px-3 py-1">PRO</Badge>
                    <span className="text-sm font-medium text-amber-900">Premium Access</span>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-zinc-300 text-zinc-500 font-bold px-3 py-1">FREE</Badge>
                    <span className="text-sm font-medium text-zinc-500">Standard Access</span>
                  </>
                )}
              </div>
              {!(session.user.role === 'premium_student' || session.user.role === 'super_admin') && (
                <Link href="#pricing">
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50 text-xs font-bold gap-1">
                    UPGRADE <Sparkles className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subjects */}
        <div className="lg:col-span-2 space-y-4">
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
                  <div className="flex flex-col gap-4">
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

                    {subjectProgress[subject.id] && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                          <span className="text-zinc-400">Total Progress</span>
                          <span className="text-teal-600">{subjectProgress[subject.id].percent}%</span>
                        </div>
                        <Progress value={subjectProgress[subject.id].percent} className="h-1.5 bg-slate-100" />
                      </div>
                    )}
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

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Social & Community */}
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-display font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/study/tribes" className="block p-4 rounded-2xl bg-teal-50 border-2 border-transparent hover:border-teal-200 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-teal-900">Study Tribes</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] font-medium text-teal-600 mt-1 uppercase tracking-wider">Join a clan & earn XP</p>
              </Link>

              <Link href="/study/community" className="block p-4 rounded-2xl bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-indigo-900">Peer Doubts</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] font-medium text-indigo-600 mt-1 uppercase tracking-wider">Help others & earn KP</p>
              </Link>
            </CardContent>
          </Card>

          {/* Live Exams */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-800 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-display font-black flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Live Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-100 text-sm mb-4">Compete nationally and win scholarship points!</p>
              <Link href="/study/live">
                <Button className="w-full bg-amber-400 text-amber-950 hover:bg-amber-500 font-black rounded-xl">
                  View Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>

          <ReferralWidget />
        </div>
      </div>

    </div>
  );
}
