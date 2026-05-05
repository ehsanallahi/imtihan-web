'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function simulateSubscriptionPurchase(plan) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user already has an active subscription
    const existingSub = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (existingSub) {
      // Just update it for this simulation
      await db.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan: plan,
          updatedAt: new Date()
        }
      });
      return { success: true, message: "Subscription updated successfully" };
    }

    // Create a new simulated subscription
    // Give them 30 days of access
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    await db.subscription.create({
      data: {
        userId: session.user.id,
        plan: plan,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        amountPkr: plan === 'student_yearly' ? 10000 : 999,
        paymentMethod: 'simulated_card',
        paymentRef: `sim_${Math.random().toString(36).substring(7)}`,
      }
    });

    return { success: true, message: "Payment successful! You are now a Premium user." };
  } catch (error) {
    console.error("Failed to simulate subscription:", error);
    return { success: false, error: "Failed to process payment" };
  }
}

export async function checkUserSubscription() {
  try {
    const session = await auth();
    if (!session) return { isPremium: false };

    const activeSub = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        endDate: {
          gte: new Date()
        }
      }
    });

    return { 
      isPremium: !!activeSub, 
      plan: activeSub?.plan || 'free'
    };
  } catch (error) {
    return { isPremium: false };
  }
}
