'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createTribe(name, description = "") {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;
    const profile = await db.studentProfile.findUnique({
      where: { userId },
      include: { tribeMemberships: true }
    });

    if (!profile) return { success: false, error: "Profile not found" };
    if (profile.tribeMemberships.length > 0) {
      return { success: false, error: "You are already in a tribe!" };
    }

    const tribe = await db.tribe.create({
      data: {
        name,
        description,
        leaderId: userId,
        members: {
          create: {
            studentProfileId: profile.id,
            role: 'LEADER'
          }
        }
      }
    });

    revalidatePath("/study/tribes");
    return { success: true, tribe };
  } catch (error) {
    console.error("CREATE_TRIBE_ERROR:", error);
    if (error.code === 'P2002') return { success: false, error: "Tribe name already exists!" };
    return { success: false, error: "Failed to create tribe" };
  }
}

export async function joinTribe(tribeId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { tribeMemberships: true }
    });

    if (!profile) return { success: false, error: "Profile not found" };
    if (profile.tribeMemberships.length > 0) {
      return { success: false, error: "You are already in a tribe!" };
    }

    await db.tribeMember.create({
      data: {
        tribeId,
        studentProfileId: profile.id,
        role: 'MEMBER'
      }
    });

    revalidatePath("/study/tribes");
    return { success: true };
  } catch (error) {
    console.error("JOIN_TRIBE_ERROR:", error);
    return { success: false, error: "Failed to join tribe" };
  }
}

export async function getTribeDetails() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        tribeMemberships: {
          include: {
            tribe: {
              include: {
                members: {
                  include: {
                    student: {
                      include: { user: { select: { name: true, avatar: true, id: true } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!profile || profile.tribeMemberships.length === 0) return null;

    return profile.tribeMemberships[0].tribe;
  } catch (error) {
    console.error("GET_TRIBE_DETAILS_ERROR:", error);
    return null;
  }
}

export async function addTribeXP(xpAmount) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { tribeMemberships: true }
    });

    if (!profile || profile.tribeMemberships.length === 0) return { success: false };

    const tribeId = profile.tribeMemberships[0].tribeId;

    // Update Tribe XP and individual contribution
    await db.$transaction([
      db.tribe.update({
        where: { id: tribeId },
        data: { xp: { increment: xpAmount } }
      }),
      db.studentProfile.update({
        where: { id: profile.id },
        data: { tribeXp: { increment: xpAmount } }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("ADD_TRIBE_XP_ERROR:", error);
    return { success: false };
  }
}

export async function getAllTribes(limit = 10) {
  try {
    const tribes = await db.tribe.findMany({
      take: limit,
      orderBy: { xp: 'desc' },
      include: {
        _count: { select: { members: true } }
      }
    });
    return tribes;
  } catch (error) {
    console.error("GET_ALL_TRIBES_ERROR:", error);
    return [];
  }
}
