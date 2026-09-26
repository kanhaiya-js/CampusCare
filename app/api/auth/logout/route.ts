import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { createAuditLog } from "@/lib/services/audit";

// SECURITY (V10): Only POST for logout - GET logout is a CSRF vulnerability
// (an attacker could embed <img src="/api/auth/logout"> to force-logout users)
export async function POST() {
  const session = await getSession();
  if (session) {
    await createAuditLog({
      actorId: session.userId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: session.userId,
    });
  }
  await clearSessionCookie();
  return apiSuccess({ message: "Logged out successfully" });
}

// Return 405 Method Not Allowed for GET requests
export async function GET() {
  return apiError("METHOD_NOT_ALLOWED", "Use POST to log out", 405);
}
