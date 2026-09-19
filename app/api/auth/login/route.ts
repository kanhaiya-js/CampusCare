import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(`login_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Too many login attempts. Please wait 1 minute.", 429);
    }

    // STABILITY: Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid input data", 422, result.error.format());
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return apiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      return apiError("ACCOUNT_LOCKED", "Your account has been deactivated or suspended. Please contact administrator.", 403);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return apiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "STAFF" | "ADMIN",
      avatarUrl: user.avatarUrl,
      studentOrEmployeeId: user.studentOrEmployeeId,
    });

    await createAuditLog({
      actorId: user.id,
      action: "USER_LOGIN",
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
    return apiError("INTERNAL_ERROR", "An unexpected error occurred during login", 500);
  }
}
