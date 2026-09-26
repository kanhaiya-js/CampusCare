import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createIssueSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { generatePublicIssueId } from "@/lib/utils/format";
import { generateUniquePublicIssueId } from "@/lib/services/issue-id";
import { calculateIssuePriority } from "@/lib/services/priority-engine";
import { findBestStaffForIssue } from "@/lib/services/assignment-engine";
import { sendNotification } from "@/lib/services/notification";
import { createAuditLog } from "@/lib/services/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const categoryId = searchParams.get("categoryId")?.trim() || "";
    const priority = searchParams.get("priority")?.trim() || "";
    const building = searchParams.get("building")?.trim() || "";
    const departmentId = searchParams.get("departmentId")?.trim() || "";
    const clubId = searchParams.get("clubId")?.trim() || "";
    const scope = searchParams.get("scope")?.trim() || ""; // "my", "assigned", "all"
    const sortBy = searchParams.get("sortBy")?.trim() || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    // Build Prisma query where clause
    const where: any = {};

    // Search query on title, description, or publicIssueId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { publicIssueId: { contains: search } },
        { room: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (clubId) {
      where.clubId = clubId;
    }

    if (priority) {
      where.priority = priority;
    }

    if (building) {
      where.location = {
        building: { contains: building },
      };
    }

    // Role-based scoping
    const userRole = session.role as string;
    const isStudentOrFaculty =
      userRole === "USER" || userRole === "STUDENT" || userRole === "FACULTY";
    if (isStudentOrFaculty && scope !== "all") {
      where.reporterId = session.userId;
    } else if (isStudentOrFaculty && scope === "all") {
      // SECURITY: General users cannot see sensitive issues reported by others
      where.AND = [
        ...(where.AND || []),
        {
          OR: [{ isSensitive: false }, { reporterId: session.userId }],
        },
      ];
    } else if (
      (userRole === "STAFF" || userRole === "MAINTENANCE_STAFF") &&
      scope === "assigned"
    ) {
      where.assignedStaffId = session.userId;
    } else if (userRole === "DEPARTMENT_COORDINATOR" && !departmentId) {
      // Coordinator defaults to their department if not overridden
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { departmentId: true },
      });
      if (user?.departmentId) {
        where.departmentId = user.departmentId;
      }
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "updated") {
      orderBy = { updatedAt: "desc" };
    } else if (sortBy === "priority") {
      orderBy = [{ priority: "desc" }, { createdAt: "desc" }];
    }

    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          location: { select: { id: true, name: true, building: true, floor: true, room: true } },
          department: { select: { id: true, name: true, code: true } },
          club: { select: { id: true, name: true } },
          reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
          assignedStaff: { select: { id: true, name: true, email: true, avatarUrl: true } },
          _count: { select: { comments: true, attachments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return apiSuccess({
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch issues error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch issues", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const rateLimit = checkRateLimit(`issue_create_${session.userId}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Issue submission rate limit exceeded. Please wait a moment.", 429);
    }

    // STABILITY (S1): Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const result = createIssueSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const errorMsg = firstIssue?.message || "Invalid issue submission data";
      return apiError("VALIDATION_ERROR", errorMsg, 422, result.error.format());
    }

    const data = result.data;

    // Fetch category for priority engine baseline
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return apiError("NOT_FOUND", "Selected category does not exist", 404);
    }

    // Fetch location
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });
    if (!location) {
      return apiError("NOT_FOUND", "Selected location does not exist", 404);
    }

    // Calculate priority automatically
    let determinedPriority = data.priority;
    if (!determinedPriority || session.role === "USER") {
      const assessment = calculateIssuePriority({
        title: data.title,
        description: data.description,
        categoryName: category.name,
        defaultCategoryPriority: category.defaultPriority as any,
      });
      determinedPriority = assessment.priority;
    }

    // Generate semantic, collision-proof public issue ID with database verification
    const publicIssueId = await generateUniquePublicIssueId({
      title: data.title,
      studentName: session.name,
      studentId: session.studentOrEmployeeId,
    });

    // Run auto-assignment engine
    const bestStaff = await findBestStaffForIssue(data.categoryId);
    const initialStatus = bestStaff ? "ASSIGNED" : "SUBMITTED";

    // Use transaction to create issue, attachments, initial history, and update staff workload
    const newIssue = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.create({
        data: {
          publicIssueId,
          title: sanitizeText(data.title, 150),
          description: sanitizeText(data.description, 3000),
          categoryId: data.categoryId,
          locationId: data.locationId,
          departmentId: data.departmentId || null,
          clubId: data.clubId || null,
          isSensitive: data.isSensitive || false,
          room: data.room ? sanitizeText(data.room, 100) : (location.room || null),
          latitude: data.latitude || location.latitude || null,
          longitude: data.longitude || location.longitude || null,
          priority: determinedPriority,
          status: initialStatus,
          reporterId: session.userId,
          assignedStaffId: bestStaff ? bestStaff.staffUserId : null,
          history: {
            create: [
              {
                actorId: session.userId,
                oldStatus: null,
                newStatus: "SUBMITTED" as const,
                comment: "Issue submitted by reporter",
              },
              ...(bestStaff
                ? [
                    {
                      actorId: session.userId,
                      oldStatus: "SUBMITTED" as const,
                      newStatus: "ASSIGNED" as const,
                      comment: `Auto-assigned to ${bestStaff.staffName} (${bestStaff.specialization})`,
                    },
                  ]
                : []),
            ],
          },
          ...(data.attachments && data.attachments.length > 0
            ? {
                attachments: {
                  create: data.attachments.map((att) => ({
                    url: att.url,
                    fileName: att.fileName,
                    fileSize: att.fileSize,
                    type: att.type,
                    uploadedById: session.userId,
                  })),
                },
              }
            : {}),
        },
        include: {
          category: true,
          location: true,
          department: true,
          club: true,
          attachments: true,
          assignedStaff: { select: { id: true, name: true, email: true } },
        },
      });

      // Update staff workload if assigned
      if (bestStaff) {
        await tx.staffProfile.update({
          where: { userId: bestStaff.staffUserId },
          data: { currentWorkload: { increment: 1 } },
        });
      }

      return issue;
    });

    // Send notifications
    await sendNotification({
      userId: session.userId,
      type: "SUBMISSION",
      title: "Issue Submitted Successfully",
      message: `Your issue #${newIssue.publicIssueId} has been registered and is under processing.`,
      issueId: newIssue.id,
    });

    if (bestStaff) {
      await sendNotification({
        userId: bestStaff.staffUserId,
        type: "ASSIGNMENT",
        title: "New Issue Assigned to You",
        message: `Issue #${newIssue.publicIssueId} (${newIssue.title}) has been assigned to you.`,
        issueId: newIssue.id,
      });
    }

    // Audit log
    await createAuditLog({
      actorId: session.userId,
      action: "ISSUE_CREATED",
      entityType: "Issue",
      entityId: newIssue.id,
      metadata: {
        publicIssueId: newIssue.publicIssueId,
        priority: newIssue.priority,
        autoAssigned: !!bestStaff,
      },
    });

    return apiSuccess(newIssue, 201);
  } catch (error) {
    console.error("Create issue error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create issue", 500);
  }
}
