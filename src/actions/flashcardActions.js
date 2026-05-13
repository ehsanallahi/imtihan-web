'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Calculates the next SRS interval using the SM-2 algorithm.
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} interval - Current interval in days
 * @param {number} quality - Performance quality (0-5)
 * @returns {Object} { nextInterval, nextEaseFactor }
 */
function calculateSM2(easeFactor, interval, quality) {
  let nextInterval;
  let nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  if (quality < 3) {
    nextInterval = 1; // Start over
  } else {
    if (interval === 0) {
      nextInterval = 1;
    } else if (interval === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * nextEaseFactor);
    }
  }

  return { nextInterval, nextEaseFactor };
}

export async function getDueFlashcards(subjectId = null) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const profile = await db.studentProfile.findUnique({ where: { userId } });
    if (!profile) return { success: false, error: "Profile not found" };

    const today = new Date();

    const dueCards = await db.studentMCQProgress.findMany({
      where: {
        studentProfileId: profile.id,
        nextReviewDate: { lte: today },
        mcq: subjectId ? { subjectId } : undefined
      },
      include: {
        mcq: true
      },
      take: 20 // Limit per session
    });

    return { success: true, cards: dueCards };
  } catch (error) {
    console.error("GET_DUE_FLASHCARDS_ERROR:", error);
    return { success: false, error: "Failed to load flashcards" };
  }
}

export async function submitFlashcardResult(progressId, quality) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const currentProgress = await db.studentMCQProgress.findUnique({
      where: { id: progressId }
    });

    if (!currentProgress) return { success: false, error: "Progress record not found" };

    const { nextInterval, nextEaseFactor } = calculateSM2(
      currentProgress.easeFactor,
      currentProgress.interval,
      quality
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    await db.studentMCQProgress.update({
      where: { id: progressId },
      data: {
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        nextReviewDate,
        lastReviewedAt: new Date()
      }
    });

    revalidatePath("/study");
    return { success: true };
  } catch (error) {
    console.error("SUBMIT_FLASHCARD_RESULT_ERROR:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

export async function addToSRS(mcqId) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    await db.studentMCQProgress.upsert({
      where: {
        studentProfileId_mcqId: {
          studentProfileId: profile.id,
          mcqId
        }
      },
      create: {
        studentProfileId: profile.id,
        mcqId,
        nextReviewDate: new Date()
      },
      update: {
        // Just refresh to current if already exists
        nextReviewDate: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error("ADD_TO_SRS_ERROR:", error);
    return { success: false, error: "Failed to add to SRS" };
  }
}
