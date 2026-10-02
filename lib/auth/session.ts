import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";

export type UserRole = "USER" | "STAFF" | "ADMIN";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tokenVersion?: number;
  avatarUrl?: string | null;
  studentOrEmployeeId?: string | null;
}

const COOKIE_NAME = "campuscare_session";

// Session lifetime: 30 days. Sliding renewal triggers at 50% remaining TTL.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_RENEWAL_THRESHOLD = 0.5; // Renew when <50% TTL remains

// SECURITY: Use only the env-configured secret with min 32 chars.
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable (min 32 chars) is required in production");
    }
    return new TextEncoder().encode("campuscare-dev-only-fallback-key-32ch");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    tokenVersion: payload.tokenVersion ?? 0,
    avatarUrl: payload.avatarUrl ?? null,
    studentOrEmployeeId: payload.studentOrEmployeeId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const res = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const payload = res.payload;

    // Validate required claims
    if (!payload.userId || !payload.email || !payload.name || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
      avatarUrl: (payload.avatarUrl as string | undefined | null) ?? null,
      studentOrEmployeeId: (payload.studentOrEmployeeId as string | undefined | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS, // 30 days
  };
  cookieStore.set(COOKIE_NAME, token, cookieOptions);
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  try {
    cookieStore.delete("campuscore_session");
    cookieStore.delete("smartcampus_session");
  } catch {
    // Ignore legacy cookie errors
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/**
 * Sliding session renewal: if the JWT is past 50% of its TTL, re-issue
 * a fresh token with a full 30-day window. Call this on every authenticated
 * page/API hit so active users are never auto-logged-out.
 *
 * Returns true if the cookie was refreshed, false if no refresh was needed.
 */
export async function refreshSessionCookie(token: string): Promise<boolean> {
  try {
    // Decode without verification (we already verified elsewhere)
    const payload = decodeJwt(token);
    const now = Math.floor(Date.now() / 1000);
    const iat = typeof payload.iat === "number" ? payload.iat : now;
    const exp = typeof payload.exp === "number" ? payload.exp : now + SESSION_MAX_AGE_SECONDS;

    const totalTTL = exp - iat;
    const remaining = exp - now;

    // Only renew if past the renewal threshold (less than 50% TTL remaining)
    if (totalTTL <= 0 || remaining > totalTTL * SESSION_RENEWAL_THRESHOLD) {
      return false;
    }

    // Re-issue a fresh session cookie with full TTL
    const sessionPayload: SessionPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
      avatarUrl: (payload.avatarUrl as string | undefined | null) ?? null,
      studentOrEmployeeId: (payload.studentOrEmployeeId as string | undefined | null) ?? null,
    };

    await setSessionCookie(sessionPayload);
    return true;
  } catch {
    return false;
  }
}

/**
 * SECURITY: Re-validates the session against the database to guarantee:
 * 1. User account still exists and is ACTIVE (not suspended/deactivated)
 * 2. Role has not been revoked
 * 3. Session tokenVersion matches DB (invalidated on password change / logout all)
 */
export async function requireActiveUser(allowedRoles?: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true, tokenVersion: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("UNAUTHORIZED");
  }

  // Token revocation check: If token version in JWT doesn't match active version in DB
  if (
    session.tokenVersion !== undefined &&
    user.tokenVersion !== undefined &&
    session.tokenVersion !== user.tokenVersion
  ) {
    throw new Error("UNAUTHORIZED");
  }

  const currentRole = user.role as UserRole;
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    throw new Error("FORBIDDEN");
  }

  return {
    ...session,
    role: currentRole,
    tokenVersion: user.tokenVersion ?? 0,
  };
}

/**
 * SECURITY: Revokes all issued sessions for a user by incrementing tokenVersion.
 * Used on password change, account suspension, or security alerts.
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to revoke sessions for user:", userId, error);
  }
}
