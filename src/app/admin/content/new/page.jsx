import { getAdminContent } from "@/actions/adminActions";
import McqBuilderForm from "@/components/admin/McqBuilderForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminNewMcqPage() {
  const { data: subjects, error } = await getAdminContent();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading dependencies: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Link href="/admin/content" className="text-teal-600 text-xs font-black uppercase flex items-center gap-1 hover:gap-2 transition-all w-fit mb-4">
           <ArrowLeft className="w-3 h-3" /> Back to Content
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Create New MCQ</h1>
        <p className="text-slate-500 font-medium italic">Manually craft a high-quality question for the bank.</p>
      </div>

      <McqBuilderForm subjects={subjects || []} />
    </div>
  );
}
