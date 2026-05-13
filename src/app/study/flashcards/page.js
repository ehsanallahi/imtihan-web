import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDueFlashcards } from "@/actions/flashcardActions";
import FlashcardPlayer from "@/components/study/FlashcardPlayer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Flashcard Review | Imtihan",
};

export default async function FlashcardsPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const subjectId = searchParams?.subjectId;
  const result = await getDueFlashcards(subjectId);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col max-w-4xl mx-auto px-4 py-6">
      <div className="flex-shrink-0 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/study">
            <div className="p-2 rounded-xl bg-white border-2 border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-800">SRS Review</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Mastering through memory</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <FlashcardPlayer 
          cards={result.success ? result.cards : []} 
        />
      </div>
    </div>
  );
}
