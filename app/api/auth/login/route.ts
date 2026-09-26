import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import {
  checkRateLimit,
  isAccountLocked,
  recordFailedAttempt,
  resetFailedAttempts,
} from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

// Dummy hash for constant-time comparison when email is not found (mitigates timing attacks)
const DUMMY_HASH = "$2a$12$e8YkZ7kR8/JqX7V9Q6/gTuGqXWb8L5Bf4L0d9i3f7c2a1b5c8d0e1";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 1. IP-based rate limiting (10 attempts / minute)
    const ipRateLimit = checkRateLimit(`login_ip_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!ipRateLimit.allowed) {
      return apiError(
        "TOO_MANY_REQUESTS",
        `Too many login attempts from this network. Please wait ${ipRateLimit.retryAfterSeconds} seconds.`,
        429
      );
    }

    // 2. Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request format", 400);
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Please provide a valid email and password", 422);
    }

    const { email, password, turnstileToken } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Cloudflare Turnstile CAPTCHA verification
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileCheck.success) {
      return apiError(
        "CAPTCHA_FAILED",
        turnstileCheck.error || "Security verification failed. Please complete the challenge.",
        403
      );
    }

    // 4. Account-specific lockout check (5 failures -> 15 min lock)
    const lockout = isAccountLocked(normalizedEmail);
    if (lockout.locked) {
      const mins = Math.ceil(lockout.remainingSeconds / 60);
      return apiError(
        "ACCOUNT_TEMPORARILY_LOCKED",
        `Account access is temporarily restricted due to multiple failed login attempts. Please try again in ${mins} minute(s) or use password recovery.`,
        429
      );
    }

    // 4. User lookup
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 5. Constant-time password verification to prevent user enumeration via timing
    const hashToVerify = user ? user.passwordHash : DUMMY_HASH;
    const isValid = await verifyPassword(password, hashToVerify);

    if (!user || !isValid) {
      // Record failed attempt against this email
      recordFailedAttempt(normalizedEmail);

      await createAuditLog({
        actorId: user ? user.id : null,
        action: "USER_LOGIN_FAILED",
        entityType: "User",
        entityId: user ? user.id : null,
        metadata: { attemptedEmail: normalizedEmail },
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
      });

      // OWASP: Uniform response, never disclose whether email exists
      return apiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // 6. Check account status
    if (user.status !== "ACTIVE") {
      await createAuditLog({
        actorId: user.id,
        action: "SUSPENDED_LOGIN_ATTEMPT",
        entityType: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
      });
      return apiError(
        "ACCOUNT_INACTIVE",
        "Your account is inactive or suspended. Please contact the campus administrator.",
        403
      );
    }

    // Reset failed attempt counter on success
    resetFailedAttempts(normalizedEmail);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure HttpOnly session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "STAFF" | "ADMIN",
      tokenVersion: user.tokenVersion ?? 0,
      avatarUrl: user.avatarUrl,
      studentOrEmployeeId: user.studentOrEmployeeId,
    });

    await createAuditLog({
      actorId: user.id,
      action: "USER_LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentOrEmployeeId: user.studentOrEmployeeId,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return apiError("INTERNAL_ERROR", "Authentication service error. Please try again.", 500);
  }
}
