"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, Users } from "lucide-react";
import StudentTable from "@/components/admin/StudentTable";

export default function StudentManagementView({ initialStudents }) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesGrade = 
        gradeFilter === "all" || 
        student.studentProfile?.grade?.toLowerCase() === gradeFilter.toLowerCase();
      
      return matchesSearch && matchesGrade;
    });
  }, [initialStudents, search, gradeFilter]);

  const premiumCount = initialStudents.filter(s => s.role === "premium_student").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Management</h1>
          <p className="text-slate-500 font-medium italic">Monitor student progress, streaks, and subscription status.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</span>
                 <span className="font-black text-teal-600 text-xl">{initialStudents.length}</span>
              </div>
              <div className="w-[1px] h-10 bg-slate-100" />
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pro Members</span>
                 <span className="font-black text-amber-500 text-xl">{premiumCount}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-teal-500"
            />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                <Filter className="w-3.5 h-3.5" /> Filter:
             </div>
             <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl border-slate-200 font-bold text-slate-700">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all" className="font-bold">All Grades</SelectItem>
                  <SelectItem value="nine" className="font-bold">Grade 9</SelectItem>
                  <SelectItem value="ten" className="font-bold">Grade 10</SelectItem>
                  <SelectItem value="eleven" className="font-bold">Grade 11</SelectItem>
                  <SelectItem value="twelve" className="font-bold">Grade 12</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>

        <StudentTable students={filteredStudents} />
        
        {filteredStudents.length === 0 && (
          <div className="p-20 text-center text-slate-400 italic font-medium">
             No students found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
