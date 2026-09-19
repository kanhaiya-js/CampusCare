import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { updateIssueStatusSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { isValidStatusTransition } from "@/lib/utils/format";
import { sendNotification } from "@/lib/services/notification";
import { createAuditLog } from "@/lib/services/audit";

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
    const result = updateIssueStatusSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid status payload", 422, result.error.format());
    }

    const { status: newStatus, comment, resolutionEvidenceUrl } = result.data;

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
      include: {
        assignedStaff: true,
        reporter: true,
      },
    });

    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    // Role-based transition check
    const allowed = isValidStatusTransition(issue.status, newStatus, session.role as any);
    if (!allowed) {
      return apiError(
        "INVALID_TRANSITION",
        `Cannot transition issue from ${issue.status} to ${newStatus} with role ${session.role}`,
        400
      );
    }

    // Staff can only update if assigned to them or if admin
    if (session.role === "STAFF" && issue.assignedStaffId !== session.userId) {
      return apiError("FORBIDDEN", "You can only update status for issues assigned to you", 403);
    }

    const oldStatus = issue.status;
    const now = new Date();

    const updatePayload: any = {
      status: newStatus,
    };

    if (newStatus === "RESOLVED") {
      updatePayload.resolvedAt = now;
    } else if (newStatus === "CLOSED") {
      updatePayload.closedAt = now;
    }

    // Perform database updates in a transaction
    const updatedIssue = await prisma.$transaction(async (tx) => {
      // Create history record
      await tx.issueHistory.create({
        data: {
          issueId: issue.id,
          actorId: session.userId,
          oldStatus,
          newStatus,
          comment: comment || `Status changed from ${oldStatus} to ${newStatus}`,
        },
      });

      // If resolution evidence is provided, attach it
      if (resolutionEvidenceUrl) {
        await tx.issueAttachment.create({
          data: {
            issueId: issue.id,
            uploadedById: session.userId,
            url: resolutionEvidenceUrl,
            fileName: "resolution-evidence.jpg",
            fileSize: 1024,
            type: "IMAGE",
          },
        });
      }

      // If issue is resolved/closed, decrement staff current workload
      if (
        (newStatus === "RESOLVED" || newStatus === "CLOSED" || newStatus === "REJECTED") &&
        oldStatus !== "RESOLVED" &&
        oldStatus !== "CLOSED" &&
        issue.assignedStaffId
      ) {
        await tx.staffProfile.updateMany({
          where: {
            userId: issue.assignedStaffId,
            currentWorkload: { gt: 0 },
          },
          data: { currentWorkload: { decrement: 1 } },
        });
      }

      return tx.issue.update({
        where: { id: issue.id },
        data: updatePayload,
        include: {
          category: true,
          location: true,
          reporter: { select: { id: true, name: true, email: true } },
          assignedStaff: { select: { id: true, name: true, email: true } },
          history: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });
    });

    // Notify reporter
    if (newStatus === "RESOLVED") {
      await sendNotification({
        userId: issue.reporterId,
        type: "RESOLUTION_CONFIRMATION",
        title: "Issue Marked as Resolved",
        message: `Your issue #${issue.publicIssueId} was marked resolved by the technician. Please confirm whether it is fixed.`,
        issueId: issue.id,
      });
    } else {
      await sendNotification({
        userId: issue.reporterId,
        type: "STATUS_CHANGE",
        title: `Issue Status: ${newStatus}`,
        message: `Issue #${issue.publicIssueId} is now ${newStatus.replace("_", " ")}.`,
        issueId: issue.id,
      });
    }

    // Audit log
    await createAuditLog({
      actorId: session.userId,
      action: "ISSUE_STATUS_CHANGED",
      entityType: "Issue",
      entityId: issue.id,
      metadata: { oldStatus, newStatus, comment },
    });

    return apiSuccess(updatedIssue);
  } catch (error) {
    console.error("Update status error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update issue status", 500);
  }
}
