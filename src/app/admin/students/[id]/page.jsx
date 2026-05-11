import { getAdminStudentDetails } from "@/actions/adminActions";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Zap, 
  Award,
  BookOpen,
  TrendingUp,
  History,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import Link from "next/link";

import StudentStatusManager from "@/components/admin/StudentStatusManager";

export const dynamic = 'force-dynamic';

export default async function AdminStudentDetailsPage({ params }) {
  const { id } = await params;
  const { data: student, error } = await getAdminStudentDetails(id);

  if (error || !student) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading student details: {error || "Student not found"}
      </div>
    );
  }

  const stats = [
    { label: "Current Streak", value: `${student.studentProfile?.studyStreak || 0} Days`, icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "MCQs Solved", value: student.studentProfile?.totalMcqsAttempted || 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg. Accuracy", value: "72%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Member Since", value: format(new Date(student.createdAt), "MMM yyyy"), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/students" className="text-teal-600 text-xs font-black uppercase flex items-center gap-1 hover:gap-2 transition-all w-fit">
           <ArrowLeft className="w-3 h-3" /> Back to Students
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 border border-slate-200 shadow-sm relative overflow-hidden">
                 {student.avatar ? <img src={student.avatar} alt="" className="w-full h-full object-cover" /> : student.name?.[0]}
              </div>
              <div>
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900">{student.name}</h1>
                    {student.role === "premium_student" && (
                       <span className="bg-gold-50 text-gold-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gold-100">Pro</span>
                    )}
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                       <Mail className="w-4 h-4" /> {student.email}
                    </p>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <p className="text-sm font-bold text-teal-600 uppercase tracking-tight">
                       {student.studentProfile?.grade || "General Grade"}
                    </p>
                 </div>
              </div>
           </div>
            <div className="flex gap-3">
               <Link href={`/dashboard?studentId=${student.id}`} target="_blank">
                  <button className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> View Dashboard
                  </button>
               </Link>
               <button className="bg-white text-slate-700 px-6 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                  Edit Profile
               </button>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                 <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
           </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Quiz History */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <History className="w-5 h-5 text-teal-600" />
                     <h3 className="font-black text-slate-900">Recent Quiz Activity</h3>
                  </div>
                  <button className="text-xs font-black text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">
                     View All History
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                           <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                           <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                           <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Time Taken</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {student.examSessions?.map((result) => (
                          <tr key={result.id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="p-4 whitespace-nowrap">
                                <p className="text-xs font-bold text-slate-900">{format(new Date(result.createdAt), "MMM d, HH:mm")}</p>
                             </td>
                             <td className="p-4">
                                <p className="text-xs font-bold text-slate-900 uppercase">{result.sessionType}</p>
                                <p className="text-[10px] font-medium text-slate-400">ID: {result.id.slice(0, 8)}</p>
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-2">
                                   <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${result.correctAnswers >= (result.totalQuestions * 0.7) ? 'bg-emerald-500' : result.correctAnswers >= (result.totalQuestions * 0.4) ? 'bg-orange-500' : 'bg-red-500'}`}
                                        style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
                                      />
                                   </div>
                                   <span className="text-xs font-black text-slate-900">{result.correctAnswers}/{result.totalQuestions}</span>
                                </div>
                             </td>
                             <td className="p-4 text-right">
                                <span className="text-xs font-medium text-slate-500">{Math.floor((result.timeTakenSeconds || 0) / 60)}m {(result.timeTakenSeconds || 0) % 60}s</span>
                             </td>
                          </tr>
                        ))}
                        {student.examSessions?.length === 0 && (
                          <tr>
                             <td colSpan="4" className="p-12 text-center text-slate-400 italic text-sm">
                                No quiz attempts recorded yet.
                             </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Sidebar: Status & Info */}
         <div className="space-y-8">
            <StudentStatusManager studentId={student.id} initialStatus={student.isActive} />

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
               <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-400" /> Current Plan
               </h3>
               
               <div className="space-y-6">
                  <div>
                     <p className="text-2xl font-black text-white">{student.role === "premium_student" ? "Premium Pro" : "Free Forever"}</p>
                     <p className="text-xs font-medium text-teal-400 mt-1">
                        {student.role === "premium_student" ? "Valid until June 2026" : "Unlock all subjects with Pro"}
                     </p>
                  </div>

                  <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all">
                     {student.role === "premium_student" ? "View Billing" : "Upgrade User"}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
