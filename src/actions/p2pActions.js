'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCommunityDoubts(subjectId = null, limit = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Fetch open doubt threads that aren't the user's own
    const threads = await db.doubtThread.findMany({
      where: {
        status: 'open',
        studentProfile: {
          userId: { not: session.user.id }
        },
        mcq: subjectId ? { subjectId } : undefined
      },
      include: {
        student: {
          include: { user: { select: { name: true, avatar: true } } }
        },
        mcq: {
          select: { question: true, subject: { select: { name: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return threads;
  } catch (error) {
    console.error("GET_COMMUNITY_DOUBTS_ERROR:", error);
    return [];
  }
}

export async function answerDoubt(threadId, content) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;

    // Add peer message to thread
    await db.doubtMessage.create({
      data: {
        threadId,
        senderId: userId,
        senderRole: 'peer',
        content
      }
    });

    revalidatePath("/study/community");
    return { success: true };
  } catch (error) {
    console.error("ANSWER_DOUBT_ERROR:", error);
    return { success: false, error: "Failed to post answer" };
  }
}

export async function resolveDoubt(threadId, helperId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // 1. Update thread status
    await db.doubtThread.update({
      where: { id: threadId },
      data: { status: 'resolved' }
    });

    // 2. Award Knowledge Points to the helper
    const helperProfile = await db.studentProfile.findUnique({
      where: { userId: helperId }
    });

    if (helperProfile) {
      await db.studentProfile.update({
        where: { id: helperProfile.id },
        data: { 
          knowledgePoints: { increment: 50 },
          tribeXp: { increment: 20 } // Also contributes to tribe if they're in one
        }
      });
      
      // Update tribe XP if member
      const member = await db.tribeMember.findFirst({
        where: { studentProfileId: helperProfile.id }
      });
      
      if (member) {
        await db.tribe.update({
          where: { id: member.tribeId },
          data: { xp: { increment: 20 } }
        });
      }
    }

    revalidatePath("/study/community");
    return { success: true };
  } catch (error) {
    console.error("RESOLVE_DOUBT_ERROR:", error);
    return { success: false, error: "Failed to resolve doubt" };
  }
}
