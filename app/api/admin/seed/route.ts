import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { seedDatabase } from "@/prisma/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const force = searchParams.get("force") === "true";

    const expectedKey = process.env.ADMIN_REGISTER_KEY || "CampusCare2026";
    if (!key || key !== expectedKey) {
      return apiError(
        "FORBIDDEN",
        `Invalid key. Pass your ADMIN_REGISTER_KEY in the URL, e.g. /api/admin/seed?key=${expectedKey}`,
        403
      );
    }

    const result = await seedDatabase(force);

    if (result && "skipped" in result) {
      return apiSuccess({
        status: "ALREADY_SEEDED",
        message: "Database is already initialized and seeded with campus data! If you want to reset, add &force=true to the URL.",
      });
    }

    return apiSuccess({
      status: "SEEDED_SUCCESSFULLY",
      message: "GLBITM campus database has been seeded successfully with departments, blocks, categories, bus routes, and admin accounts!",
    });
  } catch (error) {
    console.error("Seed execution error:", error);
    return apiError("INTERNAL_ERROR", (error as Error).message || "Failed to seed database", 500);
  }
}
