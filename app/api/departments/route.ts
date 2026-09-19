import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { departmentSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        programs: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            issues: true,
            users: true,
          },
        },
      },
    });

    return apiSuccess(departments);
  } catch (error) {
    console.error("Get departments error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve departments", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can configure departments", 403);
    }

    const body = await req.json();
    const result = departmentSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid department data", 422, result.error.format());
    }

    const existing = await prisma.department.findUnique({
      where: { code: result.data.code },
    });
    if (existing) {
      return apiError("CONFLICT", "A department with this code already exists", 409);
    }

    const department = await prisma.department.create({
      data: result.data,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "DEPARTMENT_CREATED",
      entityType: "Department",
      entityId: department.id,
      metadata: { code: department.code, name: department.name },
    });

    return apiSuccess(department, 201);
  } catch (error) {
    console.error("Create department error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create department", 500);
  }
}
