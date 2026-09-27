import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { sanitizeText } from "@/lib/security/sanitize";

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
      tokenVersion: true,
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

  // Session revocation check
  if (
    session.tokenVersion !== undefined &&
    user.tokenVersion !== undefined &&
    session.tokenVersion !== user.tokenVersion
  ) {
    return apiError("UNAUTHORIZED", "Your session has been revoked. Please log in again.", 401);
  }

  return apiSuccess({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, status: true, studentOrEmployeeId: true },
    });

    if (!currentUser || currentUser.status !== "ACTIVE") {
      return apiError("UNAUTHORIZED", "User session is no longer active", 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const { name, studentOrEmployeeId } = body;

    // Strict security check: Non-administrators CANNOT modify studentOrEmployeeId
    if (
      studentOrEmployeeId !== undefined &&
      studentOrEmployeeId !== (currentUser.studentOrEmployeeId || "") &&
      currentUser.role !== "ADMIN"
    ) {
      return apiError(
        "FORBIDDEN",
        "Student Admission Number / Employee ID is locked for institutional security. Only college administrators can modify this ID.",
        403
      );
    }

    const updateData: any = {};
    if (name && typeof name === "string") {
      const sanitizedName = sanitizeText(name.trim(), 100);
      if (sanitizedName.length >= 2) {
        updateData.name = sanitizedName;
      }
    }

    // Only update studentOrEmployeeId if current user is ADMIN
    if (currentUser.role === "ADMIN" && studentOrEmployeeId !== undefined) {
      updateData.studentOrEmployeeId = studentOrEmployeeId ? sanitizeText(studentOrEmployeeId.trim(), 50) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return apiSuccess({ user: currentUser });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentOrEmployeeId: true,
        avatarUrl: true,
      },
    });

    return apiSuccess({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
