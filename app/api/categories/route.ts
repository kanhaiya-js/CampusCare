import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { issues: true } },
      },
    });

    return apiSuccess(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can create categories", 403);
    }

    const body = await req.json();
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid category data", 422, result.error.format());
    }

    const existing = await prisma.category.findUnique({
      where: { name: result.data.name },
    });
    if (existing) {
      return apiError("CONFLICT", "A category with this name already exists", 409);
    }

    const category = await prisma.category.create({
      data: result.data,
    });

    await createAuditLog({
      actorId: session.userId,
      action: "CATEGORY_CREATED",
      entityType: "Category",
      entityId: category.id,
      metadata: { name: category.name },
    });

    return apiSuccess(category, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create category", 500);
  }
}
