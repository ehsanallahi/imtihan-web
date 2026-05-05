'use server'
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Fetches the current user's notifications.
 */
export async function getNotifications() {
  try {
    const session = await auth();
    if (!session) return [];

    return await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);
    return [];
  }
}

/**
 * Marks a notification as read.
 */
export async function markAsRead(notificationId) {
  try {
    const session = await auth();
    if (!session) return { success: false };

    await db.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("MARK_AS_READ_ERROR:", error);
    return { success: false };
  }
}

/**
 * Creates a notification for a user.
 */
export async function createNotification(userId, title, message, type = 'system') {
  try {
    return await db.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
    return null;
  }
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session) return { success: false };

    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("MARK_ALL_AS_READ_ERROR:", error);
    return { success: false };
  }
}
