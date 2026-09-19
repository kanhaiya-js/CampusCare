import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage/upload";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const rateLimit = checkRateLimit(`upload_${session.userId}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return apiError("TOO_MANY_REQUESTS", "Upload limit exceeded. Please wait a moment.", 429);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("BAD_REQUEST", "No file provided", 400);
    }

    const saved = await saveUploadedFile(file);
    return apiSuccess(saved, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("UPLOAD_FAILED", (error as Error).message || "Failed to upload file", 400);
  }
}
