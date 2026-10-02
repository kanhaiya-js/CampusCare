import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/services/audit";

/**
 * SECURITY FIX: GET /logout no longer performs logout (CSRF risk).
 * Instead it redirects to a safe POST-based logout flow.
 * The actual logout only happens via POST (same as /api/auth/logout).
 */
export async function POST(req: NextRequest) {
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
  return NextResponse.redirect(new URL("/login", req.url));
}

// SECURITY: GET /logout must NOT perform logout (CSRF via <img>, prefetch, etc.)
// Redirect to login page instead — the actual logout button uses POST.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/login", req.url));
}
