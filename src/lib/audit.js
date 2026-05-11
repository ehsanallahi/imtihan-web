import { db } from "@/lib/db";
import { auth } from "@/auth";
import { headers } from "next/headers";

/**
 * Records an audit log entry.
 * 
 * @param {Object} params - The parameters for the audit log.
 * @param {string} params.action - The action being performed (e.g., "DELETE_USER").
 * @param {string} [params.entity] - The type of entity being affected (e.g., "User").
 * @param {string} [params.entityId] - The ID of the affected entity.
 * @param {Object} [params.details] - Additional metadata for the log.
 * @param {string} [params.userId] - The ID of the user performing the action (defaults to current session user).
 */
export async function recordAuditLog({ action, entity, entityId, details, userId }) {
  try {
    let finalUserId = userId;

    if (!finalUserId) {
      const session = await auth();
      finalUserId = session?.user?.id;
    }

    if (!finalUserId) {
      console.warn("Attempted to record audit log without a user ID:", { action, entity });
      return null;
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const log = await db.auditLog.create({
      data: {
        userId: finalUserId,
        action,
        entity,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ipAddress,
        userAgent,
      },
    });

    return log;
  } catch (error) {
    console.error("Failed to record audit log:", error);
    return null;
  }
}
