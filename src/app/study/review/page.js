import { redirect } from "next/navigation";
import { startReviewSession } from "@/actions/quizActions";
import { Loader2 } from "lucide-react";

export default async function ReviewPage() {
  const result = await startReviewSession();

  if (result.success && result.sessionId) {
    redirect(`/study/quiz/${result.sessionId}?isReview=true`);
  }

  // If no reviews or failed to start
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {result.error === "No reviews due right now!" ? (
        <>
          <h2 className="text-2xl font-bold text-teal-900 mb-2">You're All Caught Up!</h2>
          <p className="text-zinc-600 mb-6">There are no questions due for review right now. Check back tomorrow.</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-rose-600 mb-2">Oops!</h2>
          <p className="text-zinc-600 mb-6">{result.error || "Failed to start review session."}</p>
        </>
      )}
    </div>
  );
}
