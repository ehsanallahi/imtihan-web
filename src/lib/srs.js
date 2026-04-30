import { db } from "@/lib/db";

/**
 * Calculates the next review date based on a simplified SM-2 algorithm.
 * @param {boolean} isCorrect 
 * @param {number} currentInterval 
 * @param {number} currentEaseFactor 
 * @returns {{ interval: number, easeFactor: number, nextReviewDate: Date }}
 */
function calculateNextReview(isCorrect, currentInterval, currentEaseFactor) {
  let newInterval;
  let newEaseFactor = currentEaseFactor;

  if (isCorrect) {
    if (currentInterval === 0) {
      newInterval = 1;
    } else if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEaseFactor);
    }
    // Slightly increase ease factor for correct answers
    newEaseFactor = Math.min(2.5, currentEaseFactor + 0.1);
  } else {
    // Reset interval if incorrect, decrease ease factor
    newInterval = 0; // Means it goes back to immediate review queue
    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
  }

  const nextReviewDate = new Date();
  if (newInterval > 0) {
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  }

  return { interval: newInterval, easeFactor: newEaseFactor, nextReviewDate };
}

/**
 * Processes SRS updates for a batch of attempted MCQs.
 * @param {string} studentProfileId 
 * @param {Array<{mcqId: string, isCorrect: boolean}>} attempts 
 */
export async function processSRS(studentProfileId, attempts) {
  try {
    const mcqIds = attempts.map(a => a.mcqId);
    
    // Fetch existing progress
    const existingProgress = await db.studentMCQProgress.findMany({
      where: {
        studentProfileId,
        mcqId: { in: mcqIds }
      }
    });

    const progressMap = new Map(existingProgress.map(p => [p.mcqId, p]));

    const updates = [];
    const creations = [];

    for (const attempt of attempts) {
      const progress = progressMap.get(attempt.mcqId);
      
      const currentInterval = progress ? progress.interval : 0;
      const currentEaseFactor = progress ? progress.easeFactor : 2.5;

      const { interval, easeFactor, nextReviewDate } = calculateNextReview(
        attempt.isCorrect,
        currentInterval,
        currentEaseFactor
      );

      if (progress) {
        updates.push(
          db.studentMCQProgress.update({
            where: { id: progress.id },
            data: { interval, easeFactor, nextReviewDate, lastReviewedAt: new Date() }
          })
        );
      } else {
        creations.push({
          studentProfileId,
          mcqId: attempt.mcqId,
          interval,
          easeFactor,
          nextReviewDate,
          lastReviewedAt: new Date()
        });
      }
    }

    // Execute database operations
    const transactions = [];
    if (creations.length > 0) {
      transactions.push(db.studentMCQProgress.createMany({ data: creations }));
    }
    transactions.push(...updates);

    if (transactions.length > 0) {
      await db.$transaction(transactions);
    }

  } catch (error) {
    console.error("Error processing SRS updates:", error);
  }
}
