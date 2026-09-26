import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { requireActiveUser, setSessionCookie } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    let session;
    try {
      session = await requireActiveUser();
    } catch {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`change_pwd_${session.userId}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError(
        "TOO_MANY_REQUESTS",
        `Too many password change attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        429
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request format", 400);
    }

    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid input data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch user password hash
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, studentOrEmployeeId: true, passwordHash: true, tokenVersion: true },
    });

    if (!user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    // Re-authenticate with current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      await createAuditLog({
        actorId: user.id,
        action: "PASSWORD_CHANGE_FAILED",
        entityType: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
      });
      return apiError("INVALID_CREDENTIALS", "The current password provided is incorrect.", 400);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    const nextTokenVersion = (user.tokenVersion ?? 0) + 1;

    // Update password and increment tokenVersion (revoking other active sessions)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        tokenVersion: nextTokenVersion,
      },
    });

    // Re-issue cookie with updated tokenVersion for current session
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "STAFF" | "ADMIN",
      tokenVersion: nextTokenVersion,
      avatarUrl: user.avatarUrl,
      studentOrEmployeeId: user.studentOrEmployeeId,
    });

    await createAuditLog({
      actorId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    return apiSuccess({
      message: "Password updated successfully. Other active sessions have been revoked.",
    });
  } catch (error) {
    console.error("Change password API error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update password. Please try again.", 500);
  }
}
