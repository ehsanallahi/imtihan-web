import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PremiumPricing from "@/components/study/PremiumPricing";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Go Premium | Imtihan",
};

export default async function PremiumPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/study">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back to Study
          </div>
        </Link>
      </div>
      
      <PremiumPricing />
    </div>
  );
}
