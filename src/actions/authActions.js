'use server'

import { db } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function registerUser({ name, email, password, grade, board }) {
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword: hashed,
        role: "student",
        studentProfile: {
          create: {
            grade: grade || null,
            board: board || null,
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

export async function updateStudentProfile({ name, grade, board, dailyGoalCount }) {
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
        dailyGoalCount: dailyGoalCount ? parseInt(dailyGoalCount) : undefined
      },
      create: { 
        userId: session.user.id, 
        grade, 
        board,
        dailyGoalCount: dailyGoalCount ? parseInt(dailyGoalCount) : 20
      }
    });

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
      where: { userId: session.user.id }
    });

    return profile;
  } catch (error) {
    console.error("Get student profile error:", error);
    return null;
  }
}
