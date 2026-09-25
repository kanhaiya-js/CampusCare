import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(`register_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Too many registration attempts. Please wait 1 minute.", 429);
    }

    // STABILITY: Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid registration data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const { name, email, password, studentOrEmployeeId, role, adminKey, departmentId } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return apiError("EMAIL_EXISTS", "An account with this email already exists", 409);
    }

    // Policy: Only students can self-register. Staff & Admin accounts must be created by an administrator.
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
        "Public self-registration is restricted exclusively to students. If you need a Staff or Administrator account, please contact an administrator (Prabhat Sir at prabhat.sir@glbitm.edu).",
        403
      );
    }

    const assignedRole: "USER" = "USER";

    const passwordHash = await hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        status: "ACTIVE",
        studentOrEmployeeId: studentOrEmployeeId && studentOrEmployeeId.trim().length > 0 ? studentOrEmployeeId.trim() : null,
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
    // SECURITY (V4): Never leak internal error messages to the client
    console.error("Register API error:", error);
    return apiError("INTERNAL_ERROR", "Registration failed. Please try again later.", 500);
  }
}
