'use server'

import { db } from "@/lib/db";

export async function validatePromoCode(code) {
  try {
    if (!code) return { success: false, error: "Promo code is required" };

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo) {
      return { success: false, error: "Invalid promo code" };
    }

    if (!promo.isActive) {
      return { success: false, error: "This promo code is no longer active" };
    }

    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return { success: false, error: "This promo code has expired" };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return { success: false, error: "This promo code has reached its maximum usage" };
    }

    return { 
      success: true, 
      discountPercent: promo.discountPercent,
      message: `Promo code applied! You get ${promo.discountPercent}% off.`
    };
  } catch (error) {
    console.error("Promo code validation error:", error);
    return { success: false, error: "Failed to validate promo code" };
  }
}
