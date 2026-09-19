import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can modify locations", 403);
    }

    const { id } = params;
    const body = await req.json();

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.building ? { building: body.building } : {}),
        ...(body.floor !== undefined ? { floor: body.floor } : {}),
        ...(body.room !== undefined ? { room: body.room } : {}),
        ...(body.latitude !== undefined ? { latitude: body.latitude } : {}),
        ...(body.longitude !== undefined ? { longitude: body.longitude } : {}),
        ...(body.parentLocationId !== undefined ? { parentLocationId: body.parentLocationId } : {}),
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: "LOCATION_UPDATED",
      entityType: "Location",
      entityId: location.id,
      metadata: body,
    });

    return apiSuccess(location);
  } catch (error) {
    console.error("Update location error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update location", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can delete locations", 403);
    }

    const { id } = params;
    const issueCount = await prisma.issue.count({ where: { locationId: id } });
    if (issueCount > 0) {
      return apiError("CONFLICT", `Cannot delete location with ${issueCount} linked issues`, 409);
    }

    await prisma.location.delete({ where: { id } });

    await createAuditLog({
      actorId: session.userId,
      action: "LOCATION_DELETED",
      entityType: "Location",
      entityId: id,
    });

    return apiSuccess({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Delete location error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete location", 500);
  }
}
