import prisma from "@/lib/db/prisma";

export interface CreateNotificationParams {
  userId: string;
  type: "SUBMISSION" | "STATUS_CHANGE" | "ASSIGNMENT" | "COMMENT" | "RESOLUTION_CONFIRMATION" | "FEEDBACK";
  title: string;
  message: string;
  issueId?: string | null;
}

export async function sendNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        issueId: params.issueId || null,
      },
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}
