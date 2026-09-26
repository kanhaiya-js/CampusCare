import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`forgot_pwd_${ip}`, { limit: 3, windowMs: 10 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError(
        "TOO_MANY_REQUESTS",
        `Too many password reset requests. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        429
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request format", 400);
    }

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Please provide a valid email address", 422);
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && user.status === "ACTIVE") {
      // 1. Generate 32-byte cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");

      // 2. Hash token using SHA-256 for persistent database storage (defense-in-depth)
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute validity

      // 3. Mark any previous unused tokens for this email as expired
      await prisma.passwordResetToken.updateMany({
        where: { email: normalizedEmail, usedAt: null },
        data: { usedAt: new Date() },
      });

      // 4. Store hashed token
      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          expiresAt,
        },
      });

      await createAuditLog({
        actorId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
      });

      // Safe logging of reset issuance (never log raw tokens in production)
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SECURITY - DEV ONLY] Password reset token generated for ${normalizedEmail}: ${rawToken}`);
      }
    }

    // OWASP: Always return the exact same generic message to prevent email enumeration
    return apiSuccess({
      message:
        "If an active account is registered with this email, password reset instructions have been issued.",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return apiError("INTERNAL_ERROR", "Unable to process password reset request at this time.", 500);
  }
}
