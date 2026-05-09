import { getWaitlist } from "@/actions/waitlist";
import { format } from "date-fns";
import { ImtihanLogo } from "@/app/page"; // We might need to export this or just recreate it
import Image from "next/image";

// Recreating logo for admin page to avoid client/server component issues if page.js is client
const AdminLogo = () => (
  <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-teal-600/20">
    <Image 
      src="/logo.png" 
      alt="Imtihan Logo" 
      width={40} 
      height={40} 
      className="object-contain"
    />
  </div>
);

export default async function AdminWaitlistPage() {
  const { data: entries, error } = await getWaitlist();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold p-8">
        Error loading waitlist: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <AdminLogo />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Waitlist Management</h1>
              <p className="text-slate-500 font-medium">Total Respondents: {entries?.length || 0}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
               Export CSV
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600">Date</th>
                <th className="p-4 font-bold text-slate-600">Name</th>
                <th className="p-4 font-bold text-slate-600">Email</th>
                <th className="p-4 font-bold text-slate-600">Phone</th>
                <th className="p-4 font-bold text-slate-600">Grade</th>
                <th className="p-4 font-bold text-slate-600">Board</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-medium text-sm">
                    {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{entry.name}</td>
                  <td className="p-4 text-teal-600 font-medium">{entry.email}</td>
                  <td className="p-4 text-slate-500 font-medium">{entry.phone || "—"}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {entry.grade || "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {entry.board || "—"}
                    </span>
                  </td>
                </tr>
              ))}
              {entries?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium italic">
                    No entries found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
