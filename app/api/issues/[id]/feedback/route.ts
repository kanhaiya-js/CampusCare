import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createFeedbackSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { sendNotification } from "@/lib/services/notification";
import { createAuditLog } from "@/lib/services/audit";
import { sanitizeText } from "@/lib/security/sanitize";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = params;
    const body = await req.json();
    const result = createFeedbackSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid feedback data", 422, result.error.format());
    }

    const { rating, resolved, comment } = result.data;
    const sanitizedComment = comment ? sanitizeText(comment, 1000) : null;

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
      include: { reporter: true, assignedStaff: true },
    });

    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    // Only the reporter (or admin) can submit resolution feedback
    if (session.userId !== issue.reporterId && session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only the reporter can confirm issue resolution", 403);
    }

    const now = new Date();
    const newStatus = resolved ? "CLOSED" : "REOPENED";

    const feedbackResult = await prisma.$transaction(async (tx) => {
      // Upsert feedback
      const feedback = await tx.feedback.upsert({
        where: { issueId: issue.id },
        create: {
          issueId: issue.id,
          userId: session.userId,
          rating,
          resolved,
          comment: sanitizedComment,
        },
        update: {
          rating,
          resolved,
          comment: sanitizedComment,
        },
      });

      // Update issue status and dates
      await tx.issue.update({
        where: { id: issue.id },
        data: {
          status: newStatus,
          closedAt: resolved ? now : null,
        },
      });

      // Add to history
      await tx.issueHistory.create({
        data: {
          issueId: issue.id,
          actorId: session.userId,
          oldStatus: issue.status,
          newStatus,
          comment: resolved
            ? `Reporter confirmed resolution with ${rating}-star rating: "${comment || "Issue verified resolved"}"`
            : `Reporter marked NOT FIXED: "${comment || "Issue remains unresolved"}"`,
        },
      });

      // If reopened, increment staff workload again if assigned
      if (!resolved && issue.assignedStaffId) {
        await tx.staffProfile.updateMany({
          where: { userId: issue.assignedStaffId },
          data: { currentWorkload: { increment: 1 } },
        });
      }

      return feedback;
    });

    // Send notifications
    if (!resolved && issue.assignedStaffId) {
      await sendNotification({
        userId: issue.assignedStaffId,
        type: "STATUS_CHANGE",
        title: `Issue #${issue.publicIssueId} Reopened`,
        message: `Reporter indicated issue was not resolved properly: "${comment || "Work needs review"}"`,
        issueId: issue.id,
      });
    }

    // Audit log
    await createAuditLog({
      actorId: session.userId,
      action: resolved ? "ISSUE_CLOSED_WITH_FEEDBACK" : "ISSUE_REOPENED",
      entityType: "Issue",
      entityId: issue.id,
      metadata: { rating, resolved, comment },
    });

    return apiSuccess({ feedback: feedbackResult, newStatus });
  } catch (error) {
    console.error("Feedback API error:", error);
    return apiError("INTERNAL_ERROR", "Failed to submit feedback", 500);
  }
}
