import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createCommentSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { sendNotification } from "@/lib/services/notification";
import { checkRateLimit } from "@/lib/security/rate-limit";

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
      where: { OR: [{ id }, { publicIssueId: id }] },
      select: { id: true },
    });

    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    const comments = await prisma.issueComment.findMany({
      where: { issueId: issue.id },
      include: {
        author: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve comments", 500);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const rateLimit = checkRateLimit(`comment_${session.userId}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Comment rate limit exceeded. Please wait.", 429);
    }

    const { id } = params;
    const body = await req.json();
    const result = createCommentSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid comment content", 422, result.error.format());
    }

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
      include: { reporter: true, assignedStaff: true },
    });

    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    const comment = await prisma.issueComment.create({
      data: {
        issueId: issue.id,
        authorId: session.userId,
        content: result.data.content,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    // Notify the other party
    // If reporter commented, notify assigned staff
    if (session.userId === issue.reporterId && issue.assignedStaffId) {
      await sendNotification({
        userId: issue.assignedStaffId,
        type: "COMMENT",
        title: `New Comment on Issue #${issue.publicIssueId}`,
        message: `${session.name} commented: "${result.data.content.slice(0, 80)}..."`,
        issueId: issue.id,
      });
    } else if (session.userId !== issue.reporterId) {
      // If staff/admin commented, notify reporter
      await sendNotification({
        userId: issue.reporterId,
        type: "COMMENT",
        title: `Technician Update on Issue #${issue.publicIssueId}`,
        message: `${session.name} commented: "${result.data.content.slice(0, 80)}..."`,
        issueId: issue.id,
      });
    }

    return apiSuccess(comment, 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create comment", 500);
  }
}
