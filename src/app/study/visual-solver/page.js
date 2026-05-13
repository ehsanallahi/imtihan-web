import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VisualSolver from "@/components/study/multimedia/VisualSolver";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Visual Problem Solver | Imtihan",
};

export default async function VisualSolverPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <Link href="/study">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back to Study
          </div>
        </Link>
      </div>
      
      <VisualSolver />
    </div>
  );
}
