import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  ArrowRight, 
  CreditCard, 
  Sparkles, 
  Shield, 
  MessageSquare, 
  Trophy, 
  Users, 
  Eye,
  Zap,
  Clock,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Star,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllSubjectsProgress } from "@/actions/progressActions";
import { Progress } from "@/components/ui/progress";
import ReferralWidget from "@/components/study/ReferralWidget";

export const metadata = {
  title: "Study Area | Imtihan",
};

export default async function StudyDashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch student profile
  const profile = await db.studentProfile.findUnique({
    where: { userId: session.user.id }
  });

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

  // Calculate basic stats
  const totalChapters = subjects.reduce((acc, sub) => acc + sub._count.chapters, 0);
  const totalMcqs = subjects.reduce((acc, sub) => acc + sub._count.mcqs, 0);

  // Fetch Subject Progress
  const progressRes = await getAllSubjectsProgress();
  const subjectProgress = progressRes.success ? progressRes.progress : {};

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* Premium Hero Section */}
      <div className="bg-slate-900 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 blur-[180px] rounded-full -mr-60 -mt-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full -ml-60 -mb-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30 shadow-xl">
                     <GraduationCap className="w-6 h-6 text-teal-400" />
                  </div>
                  <Badge className="bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 transition-colors uppercase tracking-[0.25em] text-[10px] font-black px-5 py-2 rounded-full backdrop-blur-md">
                    ACADEMIC COMMAND CENTER
                  </Badge>
               </div>
               <div className="space-y-2">
                  <h1 className="text-5xl sm:text-7xl font-display font-black text-white tracking-tighter leading-tight">
                    Master Your <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Future.</span>
                  </h1>
               </div>
               <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
                 Elite practice tools for elite students. You have <span className="text-white font-black">{subjects.length} subjects</span> ready for mastery.
               </p>
               
               <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                     <Activity className="w-4 h-4 text-emerald-400" />
                     <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Active Streak: 12 Days</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                     <Zap className="w-4 h-4 text-amber-400" />
                     <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Global Rank: #420</span>
                  </div>
               </div>
            </div>

            {/* Quick Status Card */}
            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center space-y-6 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Access</p>
               <div className="flex flex-col items-center">
                  {(session.user.role === 'premium_student' || session.user.role === 'super_admin') ? (
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-20 h-20 bg-amber-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-400/30 mb-2 relative">
                          <Trophy className="w-10 h-10 text-amber-950" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-amber-400">
                             <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                          </div>
                       </div>
                       <Badge className="bg-amber-400 text-amber-950 font-black px-6 py-2 rounded-full text-xs shadow-xl tracking-widest">PREMIUM PRO</Badge>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-2 border border-slate-700 shadow-2xl">
                          <Star className="w-10 h-10 text-slate-500" />
                       </div>
                       <Badge variant="outline" className="border-slate-700 text-slate-400 font-black px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em]">STANDARD</Badge>
                       <Link href="/pricing" className="text-xs font-black text-teal-400 hover:text-teal-300 transition-colors mt-2 tracking-[0.2em] uppercase underline decoration-2 underline-offset-4">UPGRADE ACCESS</Link>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar (Overlapping) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <MainStatBox icon={LayoutGrid} label="Subjects" value={subjects.length} color="text-teal-600" bg="bg-white" accent="border-teal-100" />
            <MainStatBox icon={Layers} label="Chapters" value={totalChapters} color="text-indigo-600" bg="bg-white" accent="border-indigo-100" />
            <MainStatBox icon={TrendingUp} label="MCQs" value={totalMcqs} color="text-emerald-600" bg="bg-white" accent="border-emerald-100" />
            <MainStatBox icon={Zap} label="Daily Goal" value="12/20" color="text-amber-600" bg="bg-white" accent="border-amber-100" />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Area: Subjects Grid */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-2.5 h-8 bg-teal-500 rounded-full shadow-lg shadow-teal-500/20" />
                  <h2 className="text-3xl font-display font-black text-slate-900 uppercase tracking-tight">Your Subjects</h2>
               </div>
            </div>

            {subjects.length === 0 ? (
              <Card className="rounded-[4rem] border-2 border-dashed border-slate-100 p-24 text-center bg-slate-50/20">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-50">
                   <BookOpen className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No subjects active</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">Please update your profile grade and board to see your subjects.</p>
              </Card>
            ) : (
              <div className="grid gap-10 grid-cols-1 sm:grid-cols-2">
                {subjects.map((subject, idx) => {
                  const progress = subjectProgress[subject.id]?.percent || 0;
                  const themes = [
                    { border: 'border-teal-100', glow: 'group-hover:border-teal-500/30', accent: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', shadow: 'shadow-teal-500/10' },
                    { border: 'border-indigo-100', glow: 'group-hover:border-indigo-500/30', accent: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', shadow: 'shadow-indigo-500/10' },
                    { border: 'border-rose-100', glow: 'group-hover:border-rose-500/30', accent: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-500/10' },
                    { border: 'border-amber-100', glow: 'group-hover:border-amber-500/30', accent: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-500/10' }
                  ];
                  const theme = themes[idx % themes.length];

                  return (
                    <Link key={subject.id} href={`/study/subject/${subject.id}`} className="group block">
                      <Card className={`rounded-[3.5rem] border-2 ${theme.border} ${theme.glow} transition-all duration-500 overflow-hidden bg-white shadow-2xl ${theme.shadow} relative flex flex-col hover:-translate-y-2`}>
                        <div className="p-10 flex-1 space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                 <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight">{subject.name}</h3>
                                 {subject.nameUrdu && (
                                   <p className="text-xl font-urdu text-slate-400 tracking-wide" dir="rtl">
                                     {subject.nameUrdu}
                                   </p>
                                 )}
                              </div>
                              <div className={`w-14 h-14 ${theme.light} rounded-2xl flex items-center justify-center ${theme.text} shadow-inner border border-white`}>
                                 <BookOpen className="w-7 h-7" />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 group-hover:bg-white transition-colors">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Chapters</p>
                                 <p className={`text-2xl font-black text-slate-800`}>{subject._count.chapters}</p>
                              </div>
                              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 group-hover:bg-white transition-colors">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Practice</p>
                                 <p className={`text-2xl font-black text-slate-800`}>{subject._count.mcqs}</p>
                              </div>
                           </div>

                           <div className="space-y-3 pt-2">
                              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                 <span>Subject Mastery</span>
                                 <span className={theme.text}>{progress}%</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                 <div 
                                    className={`h-full ${theme.accent} shadow-lg transition-all duration-1000 ease-out`}
                                    style={{ width: `${progress}%` }}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="px-10 py-6 border-t border-slate-50 bg-slate-50/30 group-hover:bg-white transition-colors flex items-center justify-between">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enter Mastery Room</span>
                           <div className={`w-10 h-10 rounded-full ${theme.accent} flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-125 transition-all`}>
                              <ArrowRight className="w-5 h-5" />
                           </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-12">
            {/* Community Tools */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
                 <h2 className="text-2xl font-display font-black text-slate-900 uppercase tracking-widest">Community</h2>
              </div>
              <div className="space-y-6">
                 <SidebarLink 
                    href="/study/tribes" 
                    icon={Shield} 
                    title="Study Tribes" 
                    desc="Elite competitive clans for collective glory." 
                    color="bg-teal-500" 
                    badge="SOCIAL"
                 />
                 <SidebarLink 
                    href="/study/community" 
                    icon={MessageSquare} 
                    title="Peer Doubts" 
                    desc="Resolve doubts with real-time peer assistance." 
                    color="bg-indigo-500" 
                    badge="HELP"
                 />
                 <SidebarLink 
                    href="/study/visual-solver" 
                    icon={Eye} 
                    title="Visual AI Solver" 
                    desc="Advanced computer vision for complex problems." 
                    color="bg-amber-500" 
                    badge="ELITE"
                 />
              </div>
            </div>

            {/* National Competition */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20" />
                 <h2 className="text-2xl font-display font-black text-slate-900 uppercase tracking-widest">Live Arena</h2>
              </div>
              <Card className="rounded-[4rem] bg-indigo-950 p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40 group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-8">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-2xl border border-white/20 shadow-2xl">
                       <Trophy className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black leading-tight tracking-tight">National <br /> Arena Schedule</h3>
                       <p className="text-indigo-300 font-medium text-sm mt-3 leading-relaxed">Compete against the top students in Pakistan and win scholarship credits.</p>
                    </div>
                    <Link href="/study/live" className="block">
                       <Button className="w-full h-18 py-8 rounded-[2rem] bg-white text-indigo-950 font-black hover:bg-slate-50 shadow-2xl transition-all border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 text-lg">
                          VIEW SCHEDULE
                       </Button>
                    </Link>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Referral Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100 mt-20">
         <ReferralWidget />
      </div>
    </div>
  );
}

function MainStatBox({ icon: Icon, label, value, color, bg, accent }) {
  return (
    <Card className={`${bg} rounded-[2.5rem] border-2 ${accent} p-6 sm:p-10 shadow-2xl shadow-slate-200/60 group hover:border-teal-500/20 transition-all duration-500`}>
       <div className="flex items-center gap-6">
          <div className={`w-14 h-14 ${color} bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white`}>
             <Icon className="w-7 h-7" />
          </div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">{label}</p>
             <h4 className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tighter text-slate-900`}>{value}</h4>
          </div>
       </div>
    </Card>
  )
}

function SidebarLink({ href, icon: Icon, title, desc, color, badge }) {
   return (
      <Link href={href} className="group block">
         <Card className="rounded-[3rem] border-2 border-slate-100 p-8 hover:border-slate-200 hover:shadow-2xl transition-all duration-500 bg-white">
            <div className="flex items-center justify-between mb-5">
               <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
               </div>
               <Badge className="bg-slate-50 text-slate-400 border-slate-100 font-black text-[8px] tracking-[0.2em] px-3 py-1 rounded-full uppercase">{badge}</Badge>
            </div>
            <div className="flex items-center justify-between gap-6">
               <div className="space-y-1.5">
                  <h4 className="font-black text-slate-900 text-xl group-hover:text-teal-600 transition-colors tracking-tight">{title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 group-hover:translate-x-2 transition-all">
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500" />
               </div>
            </div>
         </Card>
      </Link>
   )
}
