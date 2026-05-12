'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function registerUser({ name, email, password, grade, board, subjectIds, referralCode }) {
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    let referrer = null;
    if (referralCode) {
      referrer = await db.user.findUnique({ where: { referralCode } });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword: hashed,
        role: "student",
        aiCreditsBalance: referrer ? 50 : 0,
        referralReceived: referrer ? {
          create: {
            referrerId: referrer.id,
            status: "PENDING"
          }
        } : undefined,
        studentProfile: {
          create: {
            grade: grade || null,
            board: board || null,
            subjects: subjectIds?.length > 0 ? {
              connect: subjectIds.map(id => ({ id }))
            } : undefined
          }
        }
      }
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function updateStudentProfile({ name, grade, board, dailyGoalCount, subjectIds }) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    await db.user.update({
      where: { id: session.user.id },
      data: { name }
    });

    await db.studentProfile.upsert({
      where: { userId: session.user.id },
      update: { 
        grade, 
        board,
        dailyGoalCount: dailyGoalCount ? parseInt(dailyGoalCount) : undefined,
        subjects: subjectIds !== undefined ? {
          set: subjectIds.map(id => ({ id }))
        } : undefined
      },
      create: { 
        userId: session.user.id, 
        grade, 
        board,
        dailyGoalCount: dailyGoalCount ? parseInt(dailyGoalCount) : 20,
        subjects: subjectIds?.length > 0 ? {
          connect: subjectIds.map(id => ({ id }))
        } : undefined
      }
    });

    // Check for pending referral completion
    if (grade && board) {
      const pendingReferral = await db.referral.findFirst({
        where: { refereeId: session.user.id, status: "PENDING" }
      });

      if (pendingReferral) {
        // Mark as COMPLETED
        await db.referral.update({
          where: { id: pendingReferral.id },
          data: { status: "COMPLETED" }
        });

        // Award Referrer Logic
        const referrerId = pendingReferral.referrerId;
        const referrerStats = await db.user.findUnique({
          where: { id: referrerId },
          include: { _count: { select: { referralsMade: { where: { status: "COMPLETED" } } } } }
        });

        if (referrerStats) {
          const totalCompleted = referrerStats._count.referralsMade;
          const rewardsClaimed = referrerStats.rewardsClaimed;

          // Milestone: 5 Referrals -> 100 Bonus AI Credits (only if exact 5 to not give it every time)
          if (totalCompleted === 5) {
             await db.user.update({
               where: { id: referrerId },
               data: { aiCreditsBalance: { increment: 100 } }
             });
          }

          // Milestone: Every 10 Referrals -> 1 Month Premium
          if (totalCompleted - (rewardsClaimed * 10) >= 10) {
             // Create 1-month subscription
             const startDate = new Date();
             const endDate = new Date();
             endDate.setMonth(endDate.getMonth() + 1);

             await db.subscription.create({
               data: {
                 userId: referrerId,
                 plan: "student_monthly",
                 status: "active",
                 startDate,
                 endDate,
                 amountPkr: 0,
                 paymentMethod: "referral_reward",
                 paymentRef: `ref_${pendingReferral.id}`
               }
             });

             await db.user.update({
               where: { id: referrerId },
               data: { rewardsClaimed: { increment: 1 } }
             });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.hashedPassword) {
      return { success: false, error: "No password set for this account." };
    }

    const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!valid) return { success: false, error: "Current password is incorrect." };

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { hashedPassword: hashed }
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password." };
  }
}

export async function getStudentProfile() {
  try {
    const session = await auth();
    if (!session) return null;

    const profile = await db.studentProfile.findFirst({
      where: { userId: session.user.id },
      include: { subjects: true }
    });

    return profile;
  } catch (error) {
    console.error("Get student profile error:", error);
    return null;
  }
}
