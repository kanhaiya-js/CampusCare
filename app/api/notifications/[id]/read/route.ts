import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = params;
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== session.userId) {
      return apiError("NOT_FOUND", "Notification not found", 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Mark notification read error:", error);
    return apiError("INTERNAL_ERROR", "Failed to mark notification as read", 500);
  }
}
