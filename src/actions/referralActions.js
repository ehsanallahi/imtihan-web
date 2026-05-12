'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getReferralStats() {
  try {
    const session = await auth();
    if (!session) return null;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        referralsMade: {
          include: {
            referee: {
              select: { name: true, email: true, createdAt: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return null;

    // Generate a default code if they don't have one
    if (!user.referralCode) {
      const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await db.user.update({
        where: { id: user.id },
        data: { referralCode: code }
      });
      user.referralCode = code;
    }

    const pending = user.referralsMade.filter(r => r.status === 'PENDING');
    const completed = user.referralsMade.filter(r => r.status === 'COMPLETED');

    return {
      referralCode: user.referralCode,
      rewardsClaimed: user.rewardsClaimed,
      pendingReferrals: pending,
      completedReferrals: completed,
      totalPending: pending.length,
      totalCompleted: completed.length
    };
  } catch (error) {
    console.error("Get referral stats error:", error);
    return null;
  }
}

export async function updateReferralCode(newCode) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!newCode || newCode.length < 3) {
      return { success: false, error: "Code must be at least 3 characters long." };
    }

    // Check if code is taken
    const existing = await db.user.findUnique({
      where: { referralCode: newCode }
    });

    if (existing && existing.id !== session.user.id) {
      return { success: false, error: "This referral code is already taken." };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { referralCode: newCode }
    });

    return { success: true };
  } catch (error) {
    console.error("Update referral code error:", error);
    return { success: false, error: "Failed to update code." };
  }
}

export async function getTopReferrers() {
  try {
    const topUsers = await db.user.findMany({
      where: {
        role: "student",
        referralsMade: { some: { status: "COMPLETED" } }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: { referralsMade: { where: { status: "COMPLETED" } } }
        }
      },
      orderBy: {
        referralsMade: { _count: 'desc' }
      },
      take: 10
    });

    return topUsers.map(u => ({
      id: u.id,
      name: u.name || "Anonymous Student",
      avatar: u.avatar,
      completedCount: u._count.referralsMade
    }));
  } catch (error) {
    console.error("Get top referrers error:", error);
    return [];
  }
}
