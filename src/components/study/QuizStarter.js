"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Settings2, Check } from "lucide-react";
import { startExamSession } from "@/actions/quizActions";
import { useRouter } from "next/navigation";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export function QuizStarter({ chapterId, totalMcqs }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [limit, setLimit] = useState(Math.min(totalMcqs, 20));

  const handleStart = async () => {
    setIsLoading(true);
    const result = await startExamSession(chapterId, difficulty, limit);
    if (result.success) {
      router.push(`/study/quiz/${result.sessionId}?chapterId=${chapterId}${difficulty !== 'all' ? `&difficulty=${difficulty}` : ''}${limit < totalMcqs ? `&limit=${limit}` : ''}`);
    } else {
      alert(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      <Button 
        onClick={handleStart} 
        disabled={isLoading}
        size="lg" 
        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md rounded-full px-8 transition-all hover:scale-105 active:scale-95"
      >
        <PlayCircle className="w-5 h-5 mr-2" />
        {isLoading ? "Starting..." : `Start Quiz (${limit} Qs)`}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-teal-200 text-teal-700 hover:bg-teal-50">
            <Settings2 className="w-5 h-5 mr-2" />
            Customize
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-6 rounded-3xl border-teal-100 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-bold leading-none text-teal-900">Quiz Settings</h4>
              <p className="text-sm text-zinc-500">Fine-tune your practice session.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Difficulty</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["all", "easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        difficulty === d 
                          ? "bg-teal-600 border-teal-600 text-white" 
                          : "border-slate-100 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Number of Questions</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].filter(n => n <= totalMcqs).map((n) => (
                    <button
                      key={n}
                      onClick={() => setLimit(n)}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        limit === n 
                          ? "bg-teal-600 border-teal-600 text-white" 
                          : "border-slate-100 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  {totalMcqs > 20 && (
                    <button
                      onClick={() => setLimit(totalMcqs)}
                      className={`col-span-3 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        limit === totalMcqs 
                          ? "bg-teal-600 border-teal-600 text-white" 
                          : "border-slate-100 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      All ({totalMcqs})
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl" onClick={handleStart}>
              <Check className="w-4 h-4 mr-2" /> Apply & Start
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
