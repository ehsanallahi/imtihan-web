"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function joinWaitlist(formData) {
  const email = formData.get("email");
  const name = formData.get("name");
  const phone = formData.get("phone");
  const grade = formData.get("grade");
  const board = formData.get("board");
  const interest = formData.get("interest");

  if (!email || !name) {
    return { error: "Email and Name are required" };
  }

  try {
    const entry = await db.waitlistEntry.create({
      data: {
        email,
        name,
        phone,
        grade,
        board,
        interest,
      },
    });

    revalidatePath("/");
    return { success: true, data: entry };
  } catch (error) {
    console.error("Waitlist Error:", error);
    if (error.code === "P2002") {
      return { error: "You are already on the waitlist!" };
    }
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function getWaitlist() {
  try {
    if (!db.waitlistEntry) {
      console.error("DEBUG: db.waitlistEntry is UNDEFINED. Available keys:", Object.keys(db).filter(k => !k.startsWith('_')));
      throw new Error("WaitlistEntry model not found in Prisma client");
    }
    const entries = await db.waitlistEntry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: entries };
  } catch (error) {
    console.error("Fetch Waitlist Error:", error);
    return { error: `Failed to fetch waitlist: ${error.message}` };
  }
}
