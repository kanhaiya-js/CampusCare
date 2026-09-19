import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";

export type UserRole = "USER" | "STAFF" | "ADMIN";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  studentOrEmployeeId?: string | null;
}

const COOKIE_NAME = "campuscare_session";

// SECURITY: Use only the env-configured secret. No hardcoded fallbacks.
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    console.error(
      "[SECURITY] AUTH_SECRET is missing or too short (min 32 chars). JWT operations will fail in production."
    );
    // In development, allow a fallback so devs can run the app without setup.
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("campuscare-dev-only-fallback-key-32ch");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const res = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const payload = res.payload;

    // Validate that required claims exist
    if (!payload.userId || !payload.email || !payload.name || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  cookieStore.set(COOKIE_NAME, token, cookieOptions);
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  // Also clear legacy cookies if they exist, for clean migration
  try {
    cookieStore.delete("campuscore_session");
    cookieStore.delete("smartcampus_session");
  } catch {
    // Ignore — these may not exist
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
 * SECURITY: For admin/staff-critical operations, re-validate the session
 * against the database to ensure the user is still active and their role
 * hasn't been revoked since the JWT was issued.
 */
export async function requireActiveUser(allowedRoles?: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("UNAUTHORIZED");
  }

  // If the role in the DB differs from the JWT, use the DB truth
  const currentRole = user.role as UserRole;
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    throw new Error("FORBIDDEN");
  }

  // Return session with the DB-verified role
  return { ...session, role: currentRole };
}
