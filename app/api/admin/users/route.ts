import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, requireActiveUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { studentOrEmployeeId: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          studentOrEmployeeId: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
          staffProfile: true,
          _count: {
            select: { reportedIssues: true, assignedIssues: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return apiSuccess({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve users", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // SECURITY (V3): Re-validate admin status against DB
    let session;
    try {
      session = await requireActiveUser(["ADMIN"]);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "UNAUTHORIZED") return apiError("UNAUTHORIZED", "Authentication required", 401);
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    // SECURITY (V9): Rate limiting on user management
    const rateLimit = checkRateLimit(`admin_users_${session.userId}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Rate limit exceeded. Please wait a moment.", 429);
    }

    // STABILITY (S1): Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const { userId, status, role, studentOrEmployeeId } = body;

    if (!userId) {
      return apiError("BAD_REQUEST", "User ID is required", 400);
    }

    if (userId === session.userId && (status === "SUSPENDED" || status === "INACTIVE")) {
      return apiError("FORBIDDEN", "You cannot suspend your own administrator account", 400);
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "SUSPENDED" || status === "INACTIVE") {
        updateData.tokenVersion = { increment: 1 };
      }
    }
    if (role) updateData.role = role;
    if (studentOrEmployeeId !== undefined) {
      updateData.studentOrEmployeeId = studentOrEmployeeId ? studentOrEmployeeId.trim().slice(0, 50) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true, studentOrEmployeeId: true },
    });

    if (role === "STAFF" || role === "MAINTENANCE_STAFF") {
      const existingProfile = await prisma.staffProfile.findUnique({
        where: { userId },
      });
      if (!existingProfile) {
        await prisma.staffProfile.create({
          data: {
            userId,
            specialization: "GENERAL",
            availability: true,
            currentWorkload: 0,
          },
        });
      }
    }

    await createAuditLog({
      actorId: session.userId,
      action: "USER_MODIFIED_BY_ADMIN",
      entityType: "User",
      entityId: userId,
      metadata: updateData,
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update user", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let session;
    try {
      session = await requireActiveUser(["ADMIN"]);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "UNAUTHORIZED") return apiError("UNAUTHORIZED", "Authentication required", 401);
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    const rateLimit = checkRateLimit(`admin_users_delete_${session.userId}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Rate limit exceeded. Please wait a moment.", 429);
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId;
      } catch {
        // Ignored
      }
    }

    if (!userId) {
      return apiError("BAD_REQUEST", "User ID is required", 400);
    }

    if (userId === session.userId) {
      return apiError("FORBIDDEN", "You cannot delete your own administrator account", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return apiError("NOT_FOUND", "User account not found", 404);
    }

    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return apiError("FORBIDDEN", "Cannot delete the sole administrator account of the campus", 400);
      }
    }

    // Cleanly delete all associated relational data inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // 2. Delete feedback
      await tx.feedback.deleteMany({ where: { userId } });

      // 3. Delete staffProfile
      await tx.staffProfile.deleteMany({ where: { userId } });

      // 4. Unassign any assigned issues
      await tx.issue.updateMany({
        where: { assignedStaffId: userId },
        data: { assignedStaffId: null },
      });

      // 5. Delete comments, history, and attachments authored by user
      await tx.issueComment.deleteMany({ where: { authorId: userId } });
      await tx.issueAttachment.deleteMany({ where: { uploadedById: userId } });
      await tx.issueHistory.deleteMany({ where: { actorId: userId } });

      // 6. Delete issues reported by this user (including all related cascaded records)
      const userIssues = await tx.issue.findMany({
        where: { reporterId: userId },
        select: { id: true },
      });
      const issueIds = userIssues.map((i) => i.id);
      if (issueIds.length > 0) {
        await tx.feedback.deleteMany({ where: { issueId: { in: issueIds } } });
        await tx.issueComment.deleteMany({ where: { issueId: { in: issueIds } } });
        await tx.issueHistory.deleteMany({ where: { issueId: { in: issueIds } } });
        await tx.issueAttachment.deleteMany({ where: { issueId: { in: issueIds } } });
        await tx.issue.deleteMany({ where: { id: { in: issueIds } } });
      }

      // 7. Clean up audit logs associated with this user
      await tx.auditLog.deleteMany({ where: { actorId: userId } });
      await tx.auditLog.deleteMany({ where: { entityId: userId } });

      // 8. Delete user record
      await tx.user.delete({ where: { id: userId } });
    });

    await createAuditLog({
      actorId: session.userId,
      action: "USER_DELETED_BY_ADMIN",
      entityType: "User",
      entityId: userId,
      metadata: {
        deletedUserName: targetUser.name,
        deletedUserEmail: targetUser.email,
        deletedUserRole: targetUser.role,
      },
    });

    return apiSuccess({
      message: `User account ${targetUser.name} (${targetUser.email}) permanently deleted.`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete user account", 500);
  }
}

