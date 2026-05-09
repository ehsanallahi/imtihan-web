import { getAdminContent, getAdminMcqStats } from "@/actions/adminActions";
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronRight,
  Settings2
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const { data: subjects, error: subError } = await getAdminContent();
  const { data: mcqStats, error: mcqError } = await getAdminMcqStats();

  if (subError || mcqError) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading content: {subError || mcqError}
      </div>
    );
  }

  const statCards = [
    { label: "Total MCQs", value: mcqStats?.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved", value: mcqStats?.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Review", value: mcqStats?.pending, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/content/review" },
    { label: "AI Generated", value: mcqStats?.aiGenerated, icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Content Management</h1>
          <p className="text-slate-500 font-medium italic">Manage subjects, chapters, and your MCQ database.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/content/new" className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
              <Plus className="w-4 h-4" /> Add New MCQ
           </Link>
           <button className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
              <Settings2 className="w-4 h-4" /> Manage Subjects
           </button>
        </div>
      </div>

      {/* MCQ Repository Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {statCards.map((stat, i) => {
           const CardWrapper = stat.href ? Link : 'div';
           return (
             <CardWrapper 
               key={i} 
               href={stat.href}
               className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all ${stat.href ? 'hover:border-purple-500/50 hover:shadow-md cursor-pointer group' : ''}`}
             >
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} ${stat.href ? 'group-hover:bg-purple-600 group-hover:text-white transition-all' : ''}`}>
                      <stat.icon className="w-4 h-4" />
                   </div>
                   {stat.href && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />}
                </div>
                <div>
                   <span className={`text-[10px] font-black text-slate-400 uppercase tracking-widest ${stat.href ? 'group-hover:text-purple-600 transition-colors' : ''}`}>
                      {stat.label}
                   </span>
                   <p className="text-2xl font-black text-slate-900 mt-1">{stat.value || 0}</p>
                </div>
             </CardWrapper>
           );
         })}
      </div>

      {/* Subjects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-slate-900">Active Subjects</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium w-64"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {subjects?.map((subject) => (
             <div key={subject.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-teal-500/50 transition-all cursor-pointer">
                <div className="p-6 space-y-4">
                   <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                         <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                         Grade {subject.grade.replace('eleven', '11').replace('twelve', '12').replace('nine', '9').replace('ten', '10')}
                      </span>
                   </div>
                   
                   <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">{subject.name}</h3>
                      <p className="text-sm font-urdu text-teal-900/40">{subject.nameUrdu || ""}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Chapters</p>
                         <p className="text-lg font-black text-slate-900">{subject._count?.chapters || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase">MCQs</p>
                         <p className="text-lg font-black text-slate-900">{subject._count?.mcqs || 0}</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-teal-50 transition-colors">
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full" />
                      <span className="text-[10px] font-black text-teal-600 uppercase">Active</span>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-all">
                         <Settings2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-teal-600 transition-all">
                         <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
