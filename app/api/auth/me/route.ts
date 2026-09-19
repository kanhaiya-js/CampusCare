import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      studentOrEmployeeId: true,
      avatarUrl: true,
      createdAt: true,
      staffProfile: {
        select: {
          specialization: true,
          availability: true,
          currentWorkload: true,
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return apiError("UNAUTHORIZED", "User session is no longer active", 401);
  }

  return apiSuccess({ user });
}
