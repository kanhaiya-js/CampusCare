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
      return apiError("FORBIDDEN", "Only administrators can modify categories", 403);
    }

    const { id } = params;
    const body = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.icon ? { icon: body.icon } : {}),
        ...(body.defaultPriority ? { defaultPriority: body.defaultPriority } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: "CATEGORY_UPDATED",
      entityType: "Category",
      entityId: category.id,
      metadata: body,
    });

    return apiSuccess(category);
  } catch (error) {
    console.error("Update category error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update category", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can delete categories", 403);
    }

    const { id } = params;

    // Check if category has issues
    const issueCount = await prisma.issue.count({ where: { categoryId: id } });

    // If historical issues exist, soft-deactivate instead of breaking relations
    if (issueCount > 0) {
      await prisma.category.update({
        where: { id },
        data: { active: false },
      });
      return apiSuccess({ message: "Category deactivated to preserve historical issues" });
    }

    await prisma.category.delete({ where: { id } });

    await createAuditLog({
      actorId: session.userId,
      action: "CATEGORY_DELETED",
      entityType: "Category",
      entityId: id,
    });

    return apiSuccess({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete category", 500);
  }
}
