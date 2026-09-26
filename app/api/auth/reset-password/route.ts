import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`reset_pwd_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError(
        "TOO_MANY_REQUESTS",
        `Too many password reset attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        429
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request format", 400);
    }

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid input data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const { token, password } = result.data;

    // 1. Hash candidate token with SHA-256 to compare with database
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // 2. Query token record
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    const now = new Date();
    if (!resetRecord || resetRecord.usedAt !== null || resetRecord.expiresAt < now) {
      return apiError(
        "INVALID_OR_EXPIRED_TOKEN",
        "The password reset token is invalid, expired, or has already been used. Please request a new link.",
        400
      );
    }

    // 3. Find user
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return apiError("USER_NOT_FOUND", "Account associated with this token does not exist.", 404);
    }

    // 4. Hash new password with bcrypt (12 rounds)
    const newPasswordHash = await hashPassword(password);

    // 5. Atomic transaction: mark token used, update password, and increment tokenVersion to revoke all sessions
    await prisma.$transaction(async (tx) => {
      // Invalidate the reset token
      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: now },
      });

      // Update password and invalidate all active JWT sessions across all devices
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          tokenVersion: { increment: 1 },
          updatedAt: now,
        },
      });
    });

    await createAuditLog({
      actorId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    return apiSuccess({
      message: "Password has been successfully reset. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return apiError("INTERNAL_ERROR", "Unable to reset password. Please try again later.", 500);
  }
}
