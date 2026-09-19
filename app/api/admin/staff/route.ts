import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession, requireActiveUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createStaffSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return apiError("FORBIDDEN", "Staff or Admin access required", 403);
    }

    const staffMembers = await prisma.user.findMany({
      where: { role: "STAFF" },
      include: {
        staffProfile: true,
        assignedIssues: {
          select: { id: true, status: true, priority: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = staffMembers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      status: s.status,
      avatarUrl: s.avatarUrl,
      studentOrEmployeeId: s.studentOrEmployeeId,
      specialization: s.staffProfile?.specialization || "GENERAL",
      availability: s.staffProfile?.availability ?? true,
      currentWorkload: s.staffProfile?.currentWorkload || 0,
      totalAssigned: s.assignedIssues.length,
      activeTickets: s.assignedIssues.filter(
        (i) => i.status !== "RESOLVED" && i.status !== "CLOSED" && i.status !== "REJECTED"
      ).length,
      resolvedTickets: s.assignedIssues.filter(
        (i) => i.status === "RESOLVED" || i.status === "CLOSED"
      ).length,
    }));

    return apiSuccess(formatted);
  } catch (error) {
    console.error("Get staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve staff members", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY (V3): Re-validate admin status against DB for critical operation
    let session;
    try {
      session = await requireActiveUser(["ADMIN"]);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "UNAUTHORIZED") return apiError("UNAUTHORIZED", "Authentication required", 401);
      if (msg === "FORBIDDEN") return apiError("FORBIDDEN", "Only administrators can onboard staff members", 403);
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    // SECURITY (V9): Rate limiting on staff creation
    const rateLimit = checkRateLimit(`staff_create_${session.userId}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Rate limit exceeded. Please wait a moment.", 429);
    }

    // STABILITY (S1): Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    // SECURITY (V8): Use Zod schema with password validation
    const result = createStaffSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0]?.message || "Invalid staff data";
      return apiError("VALIDATION_ERROR", firstIssue, 422, result.error.format());
    }

    const { name, email, password, specialization, employeeId } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return apiError("CONFLICT", "User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newStaff = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "STAFF",
        status: "ACTIVE",
        studentOrEmployeeId: employeeId && employeeId.trim().length > 0 ? employeeId.trim() : null,
        avatarUrl,
        staffProfile: {
          create: {
            specialization: specialization.toUpperCase(),
            availability: true,
            currentWorkload: 0,
          },
        },
      },
      include: {
        staffProfile: true,
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: "STAFF_CREATED",
      entityType: "User",
      entityId: newStaff.id,
      metadata: { name, email, specialization },
    });

    return apiSuccess(newStaff, 201);
  } catch (error) {
    console.error("Create staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create staff member", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // SECURITY (V3): Re-validate admin status against DB
    let session;
    try {
      session = await requireActiveUser(["ADMIN"]);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "UNAUTHORIZED") return apiError("UNAUTHORIZED", "Authentication required", 401);
      if (msg === "FORBIDDEN") return apiError("FORBIDDEN", "Only administrators can update staff profiles", 403);
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    // STABILITY (S1): Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid request body", 400);
    }

    const { staffUserId, specialization, availability } = body;

    if (!staffUserId || typeof staffUserId !== "string") {
      return apiError("BAD_REQUEST", "Staff user ID is required", 400);
    }

    const updatedProfile = await prisma.staffProfile.upsert({
      where: { userId: staffUserId },
      create: {
        userId: staffUserId,
        specialization: specialization ? specialization.toUpperCase() : "GENERAL",
        availability: availability !== undefined ? availability : true,
        currentWorkload: 0,
      },
      update: {
        ...(specialization ? { specialization: specialization.toUpperCase() } : {}),
        ...(availability !== undefined ? { availability } : {}),
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: "STAFF_PROFILE_UPDATED",
      entityType: "StaffProfile",
      entityId: updatedProfile.id,
      metadata: { specialization, availability },
    });

    return apiSuccess(updatedProfile);
  } catch (error) {
    console.error("Update staff error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update staff profile", 500);
  }
}
