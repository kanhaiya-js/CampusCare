import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";
import { sanitizeText } from "@/lib/security/sanitize";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`register_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError(
        "TOO_MANY_REQUESTS",
        `Too many registration attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        429
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request format", 400);
    }

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid registration data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const { name, email, password, studentOrEmployeeId, role, departmentId, turnstileToken } = result.data;

    // Cloudflare Turnstile CAPTCHA verification
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileCheck.success) {
      return apiError(
        "CAPTCHA_FAILED",
        turnstileCheck.error || "Security verification failed. Please complete the challenge.",
        403
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return apiError("EMAIL_EXISTS", "An account with this email already exists", 409);
    }

    // Role protection: Public self-registration is strictly for students
    if (
      role === "ADMIN" ||
      role === "STAFF" ||
      role === "MAINTENANCE_STAFF" ||
      role === "FACULTY" ||
      role === "DEPARTMENT_COORDINATOR" ||
      body.role === "ADMIN" ||
      body.role === "STAFF" ||
      body.role === "MAINTENANCE_STAFF" ||
      body.role === "FACULTY"
    ) {
      return apiError(
        "FORBIDDEN",
        "Public self-registration is restricted exclusively to students. Staff or Administrator accounts must be onboarded by campus administration.",
        403
      );
    }

    const assignedRole: "USER" = "USER";
    const passwordHash = await hashPassword(password);
    const sanitizedName = sanitizeText(name, 100);
    const sanitizedId = studentOrEmployeeId ? sanitizeText(studentOrEmployeeId, 50) : null;
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(sanitizedName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        status: "ACTIVE",
        tokenVersion: 0,
        studentOrEmployeeId: sanitizedId,
        avatarUrl,
        departmentId: departmentId && departmentId.trim().length > 0 ? departmentId.trim() : null,
        lastLoginAt: new Date(),
      },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "STAFF" | "ADMIN",
      tokenVersion: 0,
      avatarUrl: user.avatarUrl,
      studentOrEmployeeId: user.studentOrEmployeeId,
    });

    await createAuditLog({
      actorId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    return apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          studentOrEmployeeId: user.studentOrEmployeeId,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Register API error:", error);
    return apiError("INTERNAL_ERROR", "Registration failed. Please try again later.", 500);
  }
}
