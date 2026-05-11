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
import { Search, Filter, Mail, Phone, Calendar } from "lucide-react";
import ExportButton from "@/components/admin/ExportButton";
import { format } from "date-fns";

export default function WaitlistManagementView({ entries }) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.name?.toLowerCase().includes(search.toLowerCase()) ||
        entry.email?.toLowerCase().includes(search.toLowerCase()) ||
        entry.phone?.toLowerCase().includes(search.toLowerCase());
      
      const matchesGrade = 
        gradeFilter === "all" || 
        entry.grade?.toLowerCase() === gradeFilter.toLowerCase();
      
      return matchesSearch && matchesGrade;
    });
  }, [entries, search, gradeFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Waitlist Management</h1>
          <p className="text-slate-500 font-medium italic">View and manage users who signed up for early access.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton 
            data={filteredEntries} 
            filename="imtihan_waitlist" 
            headers={["name", "email", "phone", "grade", "board", "interest", "createdAt"]} 
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, email or phone..." 
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
                  <SelectItem value="9" className="font-bold">Grade 9</SelectItem>
                  <SelectItem value="10" className="font-bold">Grade 10</SelectItem>
                  <SelectItem value="11" className="font-bold">Grade 11</SelectItem>
                  <SelectItem value="12" className="font-bold">Grade 12</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">User Details</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Academic Info</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Interest</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Signed Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">{entry.name}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Mail className="w-3 h-3" /> {entry.email}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                          <Phone className="w-3 h-3" /> {entry.phone || "No Phone"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-teal-900 uppercase tracking-tight">Grade {entry.grade}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{entry.board}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {entry.interest || "General"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" /> {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEntries.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic font-medium">
               No waitlist entries found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
