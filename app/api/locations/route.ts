import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { locationSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        parentLocation: { select: { id: true, name: true, building: true } },
        subLocations: { select: { id: true, name: true, floor: true, room: true } },
        _count: { select: { issues: true } },
      },
      orderBy: [{ building: "asc" }, { name: "asc" }],
    });

    return apiSuccess(locations);
  } catch (error) {
    console.error("Get locations error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve locations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can create campus locations", 403);
    }

    const body = await req.json();
    const result = locationSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid location data", 422, result.error.format());
    }

    const location = await prisma.location.create({
      data: result.data,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "LOCATION_CREATED",
      entityType: "Location",
      entityId: location.id,
      metadata: { name: location.name, building: location.building },
    });

    return apiSuccess(location, 201);
  } catch (error) {
    console.error("Create location error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create location", 500);
  }
}
