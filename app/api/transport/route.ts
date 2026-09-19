import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { transportRouteSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const routes = await prisma.transportRoute.findMany({
      where: { active: true },
      orderBy: { routeNumber: "asc" },
    });

    return apiSuccess(routes);
  } catch (error) {
    console.error("Get transport routes error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve transport routes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can configure transport routes", 403);
    }

    const body = await req.json();
    const result = transportRouteSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid transport route data", 422, result.error.format());
    }

    const existing = await prisma.transportRoute.findUnique({
      where: { routeNumber: result.data.routeNumber },
    });
    if (existing) {
      return apiError("CONFLICT", "A route with this route number already exists", 409);
    }

    const route = await prisma.transportRoute.create({
      data: result.data,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "TRANSPORT_ROUTE_CREATED",
      entityType: "TransportRoute",
      entityId: route.id,
      metadata: { routeNumber: route.routeNumber, routeName: route.routeName },
    });

    return apiSuccess(route, 201);
  } catch (error) {
    console.error("Create transport route error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create transport route", 500);
  }
}
