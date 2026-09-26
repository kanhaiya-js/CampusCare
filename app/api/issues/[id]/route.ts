import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { updateIssueSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = params;

    const issue = await prisma.issue.findFirst({
      where: {
        OR: [{ id }, { publicIssueId: id }],
      },
      include: {
        category: true,
        department: true,
        club: true,
        location: {
          include: {
            parentLocation: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            studentOrEmployeeId: true,
            role: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            staffProfile: {
              select: {
                specialization: true,
                currentWorkload: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        },
        history: {
          orderBy: { createdAt: "asc" },
          include: {
            actor: {
              select: { id: true, name: true, role: true, avatarUrl: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, role: true, avatarUrl: true },
            },
          },
        },
        feedback: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    const userRole = session.role as string;
    const isReporter = issue.reporterId === session.userId;
    const isStaffOrAdmin =
      userRole === "ADMIN" ||
      userRole === "STAFF" ||
      userRole === "MAINTENANCE_STAFF" ||
      userRole === "DEPARTMENT_COORDINATOR";

    // SECURITY: Non-authorized users cannot access sensitive issues (ragging, mental health, private reports)
    if (issue.isSensitive && !isReporter && !isStaffOrAdmin) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    if (!isReporter && !isStaffOrAdmin && issue.reporter) {
      // Hide student ID from general viewers for privacy compliance
      issue.reporter.studentOrEmployeeId = null;
    }

    return apiSuccess(issue);
  } catch (error) {
    console.error("Get issue error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve issue", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    // SECURITY (V9): Rate limiting on issue updates
    const rateLimit = checkRateLimit(`issue_update_${session.userId}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Update rate limit exceeded. Please wait a moment.", 429);
    }

    const { id } = params;

    // STABILITY (S1): Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    // SECURITY (V7): Validate all PATCH input with Zod schema
    const result = updateIssueSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid update data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const validatedData = result.data;

    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    // Permission check
    const userRole = session.role as string;
    const isReporter = existing.reporterId === session.userId;
    const isAdmin = userRole === "ADMIN" || userRole === "DEPARTMENT_COORDINATOR";
    const isStaff = userRole === "STAFF" || userRole === "MAINTENANCE_STAFF";

    if (!isAdmin && !isStaff && (!isReporter || existing.status !== "SUBMITTED")) {
      return apiError("FORBIDDEN", "You do not have permission to modify this issue", 403);
    }

    const updateData: any = {};
    if (validatedData.title) updateData.title = sanitizeText(validatedData.title, 150);
    if (validatedData.description) updateData.description = sanitizeText(validatedData.description, 3000);
    if (validatedData.room !== undefined) updateData.room = validatedData.room ? sanitizeText(validatedData.room, 100) : null;
    if (validatedData.categoryId) updateData.categoryId = validatedData.categoryId;
    if (validatedData.locationId) updateData.locationId = validatedData.locationId;
    if (validatedData.departmentId !== undefined) updateData.departmentId = validatedData.departmentId;
    if (validatedData.clubId !== undefined) updateData.clubId = validatedData.clubId;

    // Only Admin or Staff can modify priority directly
    if (validatedData.priority && (isAdmin || isStaff)) {
      updateData.priority = validatedData.priority;
    }

    const updated = await prisma.issue.update({
      where: { id: existing.id },
      data: updateData,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "ISSUE_UPDATED",
      entityType: "Issue",
      entityId: existing.id,
      metadata: updateData,
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Update issue error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update issue", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can delete issues", 403);
    }

    const { id } = params;
    const existing = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    await prisma.issue.delete({
      where: { id: existing.id },
    });

    await createAuditLog({
      actorId: session.userId,
      action: "ISSUE_DELETED",
      entityType: "Issue",
      entityId: existing.id,
    });

    return apiSuccess({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Delete issue error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete issue", 500);
  }
}
