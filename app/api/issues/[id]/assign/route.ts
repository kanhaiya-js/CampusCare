import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { assignStaffSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { sendNotification } from "@/lib/services/notification";
import { createAuditLog } from "@/lib/services/audit";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can assign staff to issues", 403);
    }

    const { id } = params;
    const body = await req.json();
    const result = assignStaffSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid assignment data", 422, result.error.format());
    }

    const { staffId, comment } = result.data;

    const issue = await prisma.issue.findFirst({
      where: { OR: [{ id }, { publicIssueId: id }] },
    });
    if (!issue) {
      return apiError("NOT_FOUND", "Issue not found", 404);
    }

    const staffUser = await prisma.user.findUnique({
      where: { id: staffId },
      include: { staffProfile: true },
    });
    if (!staffUser || staffUser.role !== "STAFF" || staffUser.status !== "ACTIVE") {
      return apiError("BAD_REQUEST", "Selected user is not an active staff member", 400);
    }

    const oldStaffId = issue.assignedStaffId;

    const updatedIssue = await prisma.$transaction(async (tx) => {
      // If reassigned from someone else, decrement old staff workload
      if (oldStaffId && oldStaffId !== staffId) {
        await tx.staffProfile.updateMany({
          where: { userId: oldStaffId, currentWorkload: { gt: 0 } },
          data: { currentWorkload: { decrement: 1 } },
        });
      }

      // Increment new staff workload
      if (oldStaffId !== staffId) {
        await tx.staffProfile.updateMany({
          where: { userId: staffId },
          data: { currentWorkload: { increment: 1 } },
        });
      }

      const nextStatus = issue.status === "SUBMITTED" || issue.status === "VERIFIED" ? "ASSIGNED" : issue.status;

      await tx.issueHistory.create({
        data: {
          issueId: issue.id,
          actorId: session.userId,
          oldStatus: issue.status,
          newStatus: nextStatus,
          comment: comment || `Assigned to technician ${staffUser.name}`,
        },
      });

      return tx.issue.update({
        where: { id: issue.id },
        data: {
          assignedStaffId: staffId,
          status: nextStatus,
        },
        include: {
          assignedStaff: { select: { id: true, name: true, email: true } },
          reporter: { select: { id: true, name: true } },
        },
      });
    });

    // Notify assigned staff
    await sendNotification({
      userId: staffId,
      type: "ASSIGNMENT",
      title: "Issue Assigned",
      message: `You have been assigned to issue #${issue.publicIssueId}: "${issue.title}".`,
      issueId: issue.id,
    });

    // Audit log
    await createAuditLog({
      actorId: session.userId,
      action: "ISSUE_ASSIGNED",
      entityType: "Issue",
      entityId: issue.id,
      metadata: { oldStaffId, newStaffId: staffId, comment },
    });

    return apiSuccess(updatedIssue);
  } catch (error) {
    console.error("Assign staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to assign staff", 500);
  }
}
