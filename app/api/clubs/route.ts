import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { clubSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    });

    return apiSuccess(clubs);
  } catch (error) {
    console.error("Get clubs error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve student societies", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can configure student clubs", 403);
    }

    const body = await req.json();
    const result = clubSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid club data", 422, result.error.format());
    }

    const existing = await prisma.club.findUnique({
      where: { name: result.data.name },
    });
    if (existing) {
      return apiError("CONFLICT", "A club with this name already exists", 409);
    }

    const club = await prisma.club.create({
      data: result.data,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "CLUB_CREATED",
      entityType: "Club",
      entityId: club.id,
      metadata: { name: club.name, category: club.category },
    });

    return apiSuccess(club, 201);
  } catch (error) {
    console.error("Create club error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create student club", 500);
  }
}
