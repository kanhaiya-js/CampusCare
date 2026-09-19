import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: session.userId, readAt: null },
      }),
    ]);

    return apiSuccess({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve notifications", 500);
  }
}

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    await prisma.notification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: new Date() },
    });

    return apiSuccess({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update notifications", 500);
  }
}
