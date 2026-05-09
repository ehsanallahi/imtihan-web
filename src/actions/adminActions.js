"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

async function ensureAdmin() {
  const session = await auth();
  const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent"];
  
  if (!session?.user || !adminRoles.includes(session.user.role)) {
    throw new Error("Unauthorized access to admin actions");
  }
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
        mcqs: mcqCount
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
        _count: {
          select: { chapters: true, mcqs: true }
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
    
    const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent"];
    
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
    
    return { success: true };
  } catch (error) {
    console.error("Delete MCQ Error:", error);
    return { error: error.message };
  }
}

