"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { recordAuditLog } from "@/lib/audit";

async function ensureAdmin() {
  const session = await auth();
  console.log("ensureAdmin session:", session);
  const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent", "institution_admin", "admin"];
  
  if (!session?.user || !adminRoles.includes(session.user.role)) {
    throw new Error(`Unauthorized access to admin actions. Role: ${session?.user?.role || "undefined"}`);
  }
  return session;
}

export async function getAdminStudents() {
  try {
    await ensureAdmin();
    
    const students = await db.user.findMany({
      where: {
        role: {
          in: ["student", "premium_student"]
        }
      },
      include: {
        studentProfile: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { success: true, data: students };
  } catch (error) {
    console.error("Admin Students Error:", error);
    return { error: error.message };
  }
}

export async function getAdminTeachers() {
  try {
    await ensureAdmin();
    
    const teachers = await db.user.findMany({
      where: {
        role: "teacher"
      },
      include: {
        teacherProfile: {
          include: {
            institution: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { success: true, data: teachers };
  } catch (error) {
    console.error("Admin Teachers Error:", error);
    return { error: error.message };
  }
}

export async function getAdminStats() {
  try {
    await ensureAdmin();
    
    const [userCount, studentCount, teacherCount, premiumCount, mcqCount] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "student" } }),
      db.user.count({ where: { role: "teacher" } }),
      db.user.count({ where: { role: "premium_student" } }),
      db.mCQ.count()
    ]);
    
    return {
      success: true,
      data: {
        totalUsers: userCount,
        students: studentCount,
        teachers: teacherCount,
        premium: premiumCount,
        mcqs: mcqCount,
        recentStudents: await db.user.findMany({
          where: { role: { in: ["student", "premium_student"] } },
          include: { studentProfile: true },
          orderBy: { updatedAt: "desc" },
          take: 5
        })
      }
    };
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return { error: error.message };
  }
}

export async function getAdminContent() {
  try {
    await ensureAdmin();
    
    const subjects = await db.subject.findMany({
      include: {
        chapters: {
          orderBy: { number: "asc" }
        },
        _count: {
          select: { mcqs: true }
        }
      },
      orderBy: [
        { grade: "asc" },
        { name: "asc" }
      ]
    });
    
    return { success: true, data: subjects };
  } catch (error) {
    console.error("Admin Content Error:", error);
    return { error: error.message };
  }
}

export async function getAdminMcqStats() {
  try {
    await ensureAdmin();
    
    const [total, approved, pending, aiGenerated] = await Promise.all([
      db.mCQ.count(),
      db.mCQ.count({ where: { isApproved: true } }),
      db.mCQ.count({ where: { isApproved: false } }),
      db.mCQ.count({ where: { isAiGenerated: true } })
    ]);
    
    return {
      success: true,
      data: {
        total,
        approved,
        pending,
        aiGenerated
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getAdminUsers() {
  try {
    await ensureAdmin();
    
    const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent", "institution_admin"];
    
    const admins = await db.user.findMany({
      where: {
        role: {
          in: adminRoles
        }
      },
      orderBy: {
        role: "asc"
      }
    });
    
    return { success: true, data: admins };
  } catch (error) {
    console.error("Admin Users Fetch Error:", error);
    return { error: error.message };
  }
}

export async function getPendingMcqs() {
  try {
    await ensureAdmin();
    
    const mcqs = await db.mCQ.findMany({
      where: {
        isApproved: false
      },
      include: {
        subject: true,
        chapter: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { success: true, data: mcqs };
  } catch (error) {
    console.error("Pending MCQs Fetch Error:", error);
    return { error: error.message };
  }
}

export async function approveMcq(id) {
  try {
    await ensureAdmin();
    
    await db.mCQ.update({
      where: { id },
      data: { isApproved: true }
    });

    await recordAuditLog({
      action: "APPROVE_MCQ",
      entity: "MCQ",
      entityId: id,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Approve MCQ Error:", error);
    return { error: error.message };
  }
}

export async function deleteMcq(id) {
  try {
    await ensureAdmin();
    
    await db.mCQ.delete({
      where: { id }
    });

    await recordAuditLog({
      action: "DELETE_MCQ",
      entity: "MCQ",
      entityId: id,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Delete MCQ Error:", error);
    return { error: error.message };
  }
}

export async function getAdminStudentDetails(id) {
  try {
    await ensureAdmin();
    
    const student = await db.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        examSessions: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        subscriptions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
    
    if (!student) throw new Error("Student not found");
    
    return { success: true, data: student };
  } catch (error) {
    console.error("Student Details Error:", error);
    return { error: error.message };
  }
}

export async function createMcq(data) {
  try {
    const session = await auth();
    await ensureAdmin();
    
    const mcq = await db.mCQ.create({
      data: {
        question: data.question,
        questionUrdu: data.questionUrdu,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctOption,
        explanation: data.explanation,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        createdById: session.user.id,
        isApproved: true,
        isAiGenerated: false
      }
    });

    await recordAuditLog({
      action: "CREATE_MCQ",
      entity: "MCQ",
      entityId: mcq.id,
      details: { question: data.question }
    });
    
    return { success: true, data: mcq };
  } catch (error) {
    console.error("Create MCQ Error:", error);
    return { error: error.message };
  }
}

export async function getAdminSubscriptionStats() {
  try {
    await ensureAdmin();
    
    const [activeSubscriptions, totalRevenue] = await Promise.all([
      db.subscription.findMany({
        where: { status: "active" },
        include: { user: true }
      }),
      db.subscription.aggregate({
        _sum: { amountPkr: true }
      })
    ]);
    
    // Calculate Monthly Recurring Revenue (Estimate)
    const mrr = activeSubscriptions.reduce((acc, sub) => {
      const monthlyAmount = sub.plan.includes('yearly') ? sub.amountPkr / 12 : sub.amountPkr;
      return acc + monthlyAmount;
    }, 0);
    
    return { 
      success: true, 
      data: {
        activeCount: activeSubscriptions.length,
        totalRevenue: totalRevenue._sum.amountPkr || 0,
        mrr: Math.round(mrr),
        recentPayments: activeSubscriptions.slice(0, 10)
      } 
    };
  } catch (error) {
    console.error("Subscription Stats Error:", error);
    return { error: error.message };
  }
}

export async function broadcastNotification(data) {
  try {
    await ensureAdmin();
    
    // Fetch all active students
    const users = await db.user.findMany({
      where: {
        role: { in: ["student", "premium_student"] }
      },
      select: { id: true }
    });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user.id,
      title: data.title,
      message: data.message,
      type: "system"
    }));
    
    await db.notification.createMany({
      data: notifications
    });

    await recordAuditLog({
      action: "BROADCAST_NOTIFICATION",
      entity: "Notification",
      details: { title: data.title, count: users.length }
    });
    
    return { success: true, count: users.length };
  } catch (error) {
    console.error("Broadcast Error:", error);
    return { error: error.message };
  }
}

export async function getAuditLogs() {
  try {
    await ensureAdmin();
    
    const logs = await db.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });
    
    return { success: true, data: logs };
  } catch (error) {
    console.error("Audit Logs Error:", error);
    return { error: error.message };
  }
}

export async function toggleUserStatus(userId) {
  try {
    await ensureAdmin();
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });
    
    if (!user) throw new Error("User not found");
    
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    await recordAuditLog({
      action: "TOGGLE_USER_STATUS",
      entity: "User",
      entityId: userId,
      details: { newStatus: updatedUser.isActive }
    });
    
    return { success: true, isActive: updatedUser.isActive };
  } catch (error) {
    console.error("Toggle Status Error:", error);
    return { error: error.message };
  }
}

export async function impersonateUser(targetUserId) {
  try {
    await ensureAdmin();
    
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!targetUser) throw new Error("Target user not found");
    
    await recordAuditLog({
      action: "IMPERSONATE_START",
      entity: "User",
      entityId: targetUserId,
      details: { targetName: targetUser.name, targetEmail: targetUser.email }
    });
    
    return { success: true, data: targetUser };
  } catch (error) {
    console.error("Impersonation Error:", error);
    return { error: error.message };
  }
}

export async function getAiUsageStats() {
  try {
    await ensureAdmin();
    
    // Total usage across all users
    const totalUsage = await db.aiUsage.aggregate({
      _sum: { count: true }
    });
    
    // Usage over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyUsage = await db.aiUsage.groupBy({
      by: ['date'],
      where: {
        date: { gte: thirtyDaysAgo }
      },
      _sum: { count: true },
      orderBy: { date: 'asc' }
    });
    
    // Top users by AI usage
    const topUsers = await db.aiUsage.groupBy({
      by: ['userId'],
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take: 10
    });
    
    const topUsersWithDetails = await Promise.all(
      topUsers.map(async (u) => {
        const user = await db.user.findUnique({
          where: { id: u.userId },
          select: { name: true, email: true }
        });
        return { ...u, user };
      })
    );
    
    return { 
      success: true, 
      data: {
        total: totalUsage._sum.count || 0,
        dailyUsage,
        topUsers: topUsersWithDetails
      } 
    };
  } catch (error) {
    console.error("AI Usage Stats Error:", error);
    return { error: error.message };
  }
}


export async function updateUserRole(userId, newRole) {
  try {
    await ensureAdmin();
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true }
    });
    
    if (!user) throw new Error("User not found");
    
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    
    await recordAuditLog({
      action: "UPDATE_USER_ROLE",
      entity: "User",
      entityId: userId,
      details: { oldRole: user.role, newRole: newRole, userName: user.name }
    });
    
    return { success: true, role: updatedUser.role };
  } catch (error) {
    console.error("Update Role Error:", error);
    return { error: error.message };
  }
}

export async function verifyTeacher(teacherId) {
  try {
    await ensureAdmin();
    
    const teacher = await db.teacherProfile.findUnique({
      where: { userId: teacherId },
      include: { user: true }
    });
    
    if (!teacher) throw new Error("Teacher profile not found");
    
    await db.teacherProfile.update({
      where: { userId: teacherId },
      data: { isVerified: true }
    });
    
    await recordAuditLog({
      action: "VERIFY_TEACHER",
      entity: "TeacherProfile",
      entityId: teacherId,
      details: { teacherName: teacher.user.name }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Verify Teacher Error:", error);
    return { error: error.message };
  }
}

export async function getInstitutions() {
  try {
    await ensureAdmin();
    const institutions = await db.institution.findMany({
      include: {
        _count: { select: { teachers: true } }
      },
      orderBy: { name: "asc" }
    });
    return { success: true, data: institutions };
  } catch (error) {
    console.error("Get Institutions Error:", error);
    return { error: error.message };
  }
}

export async function createInstitution(data) {
  try {
    const session = await ensureAdmin();
    
    const inst = await db.institution.create({ 
      data: {
        name: data.name,
        city: data.address, // Mapping address to city field in schema
        adminId: session.user.id
      } 
    });
    
    await recordAuditLog({
      action: "CREATE_INSTITUTION",
      entity: "Institution",
      entityId: inst.id,
      details: { name: inst.name }
    });
    return { success: true, data: inst };
  } catch (error) {
    console.error("Create Institution Error:", error);
    return { error: error.message };
  }
}

export async function deleteInstitution(id) {
  try {
    await ensureAdmin();
    await db.institution.delete({ where: { id } });
    await recordAuditLog({
      action: "DELETE_INSTITUTION",
      entity: "Institution",
      entityId: id
    });
    return { success: true };
  } catch (error) {
    console.error("Delete Institution Error:", error);
    return { error: error.message };
  }
}

