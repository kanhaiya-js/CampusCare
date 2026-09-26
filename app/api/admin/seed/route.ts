import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { seedDatabase } from "@/prisma/seed";
import { requireActiveUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/services/audit";

export const dynamic = "force-dynamic";

/**
 * SECURITY: Database seeding is an administrative operation.
 * It strictly requires an authenticated ADMIN session and POST method.
 * Never allow unauthenticated invocation or leak secrets via query parameters.
 */
export async function POST(req: NextRequest) {
  try {
    let session;
    try {
      session = await requireActiveUser(["ADMIN"]);
    } catch {
      return apiError("FORBIDDEN", "Administrator credentials required", 403);
    }

    let force = false;
    try {
      const body = await req.json();
      force = Boolean(body?.force);
    } catch {
      // Body is optional
    }

    const result = await seedDatabase(force);

    await createAuditLog({
      actorId: session.userId,
      action: "DATABASE_SEEDED",
      entityType: "System",
      metadata: { force },
    });

    if (result && "skipped" in result) {
      return apiSuccess({
        status: "ALREADY_SEEDED",
        message: "Database is already initialized with campus data.",
      });
    }

    return apiSuccess({
      status: "SEEDED_SUCCESSFULLY",
      message: "Campus database seeded successfully.",
    });
  } catch (error) {
    console.error("Seed execution error:", error);
    return apiError("INTERNAL_ERROR", "Failed to initialize database", 500);
  }
}

export async function GET() {
  return apiError("METHOD_NOT_ALLOWED", "Method not allowed. Use authenticated POST.", 405);
}
