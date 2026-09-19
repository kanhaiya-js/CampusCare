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

    const { userId, status, role } = body;

    if (!userId) {
      return apiError("BAD_REQUEST", "User ID is required", 400);
    }

    if (userId === session.userId && (status === "SUSPENDED" || status === "INACTIVE")) {
      return apiError("FORBIDDEN", "You cannot suspend your own administrator account", 400);
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true },
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
