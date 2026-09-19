import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
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
