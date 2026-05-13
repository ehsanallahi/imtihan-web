'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getUserCredits() {
  const session = await auth();
  if (!session) return 0;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { aiCreditsBalance: true, role: true }
  });

  return {
    balance: user?.aiCreditsBalance || 0,
    isPremium: user?.role === 'premium_student' || user?.role === 'super_admin'
  };
}

export async function checkAndDeductCredits(amount = 1) {
  const session = await auth();
  if (!session) return { allowed: false, error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return { allowed: false, error: "User not found" };

  // Unlimited for premium
  if (user.role === 'premium_student' || user.role === 'super_admin') {
    return { allowed: true };
  }

  if (user.aiCreditsBalance < amount) {
    return { allowed: false, error: "Insufficient AI credits. Upgrade to PRO or refer friends to earn more!" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { aiCreditsBalance: { decrement: amount } }
  });

  return { allowed: true };
}

export async function refreshDailyCredits() {
  try {
    const session = await auth();
    if (!session) return;

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role === 'premium_student' || user.role === 'super_admin') return;

    const today = new Date().toDateString();
    const lastRefresh = user.lastCreditRefresh?.toDateString();

    if (lastRefresh !== today) {
      // Refresh to at least 5 credits
      const newBalance = Math.max(user.aiCreditsBalance, 5);
      
      await db.user.update({
        where: { id: user.id },
        data: { 
          aiCreditsBalance: newBalance,
          lastCreditRefresh: new Date()
        }
      });
    }
  } catch (error) {
    console.error("REFRESH_DAILY_CREDITS_ERROR:", error);
  }
}
