import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "campuscare_session";

// Session lifetime: 30 days. Sliding renewal triggers at 50% remaining TTL.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_RENEWAL_THRESHOLD = 0.5; // Renew when <50% TTL remains

// SECURITY: Single secret key, no fallbacks in production
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("campuscare-dev-only-fallback-key-32ch");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sliding session renewal (middleware-safe, no next/headers dependency).
 * Checks if the verified JWT is past 50% of its TTL and, if so,
 * creates a fresh JWT + Set-Cookie header on the response.
 *
 * Returns a Set-Cookie header value if renewal is needed, otherwise null.
 */
async function buildRenewalCookie(payload: Record<string, unknown>): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const iat = typeof payload.iat === "number" ? payload.iat : now;
  const exp = typeof payload.exp === "number" ? payload.exp : now + SESSION_MAX_AGE_SECONDS;

  const totalTTL = exp - iat;
  const remaining = exp - now;

  // Only renew if past the threshold (less than 50% of TTL remaining)
  if (totalTTL <= 0 || remaining > totalTTL * SESSION_RENEWAL_THRESHOLD) {
    return null;
  }

  // Re-issue a fresh JWT with full 30-day TTL
  const freshToken = await new SignJWT({
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

  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${freshToken}`,
    `Path=/`,
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (isProduction) parts.push("Secure");

  return parts.join("; ");
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const method = request.method.toUpperCase();

    // 1. CSRF DEFENSE: Verify Origin / Referer for all state-changing API endpoints
    if (pathname.startsWith("/api/")) {
      const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
      if (isMutating) {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        if (origin && host) {
          try {
            const originHost = new URL(origin).host.toLowerCase();
            const currentHost = host.toLowerCase();

            // Allow matching host or subdomains
            if (originHost !== currentHost && !originHost.endsWith(`.${currentHost}`)) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: "CSRF_FORBIDDEN",
                    message: "Cross-site request blocked. Invalid origin.",
                  },
                },
                { status: 403 }
              );
            }
          } catch {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: "CSRF_FORBIDDEN",
                  message: "Malformed origin header.",
                },
              },
              { status: 403 }
            );
          }
        }
      }
      return NextResponse.next();
    }

    // 2. Authentication check for UI routes
    const token = request.cookies.get(COOKIE_NAME)?.value;
    let session: any = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getSecretKey(), {
          algorithms: ["HS256"],
        });
        session = payload;
      } catch {
        // Invalid/expired token — clear stale cookie and treat as unauthenticated
        session = null;
      }
    }

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedPage =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/issues/report") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/settings");

    // If on login/register page and already authenticated, redirect to appropriate home
    if (isAuthPage && session) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (session.role === "STAFF") {
        return NextResponse.redirect(new URL("/staff", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If accessing protected page without session, redirect to login
    if (isProtectedPage && !session) {
      const loginUrl = new URL("/login", request.url);
      const fullCallback = request.nextUrl.search
        ? `${pathname}${request.nextUrl.search}`
        : pathname;
      loginUrl.searchParams.set("callbackUrl", fullCallback);
      return NextResponse.redirect(loginUrl);
    }

    // Role protection: /staff requires STAFF or ADMIN
    if (pathname.startsWith("/staff") && session && session.role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role protection: /admin requires ADMIN
    if (pathname.startsWith("/admin") && session && session.role !== "ADMIN") {
      if (session.role === "STAFF") {
        return NextResponse.redirect(new URL("/staff", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. SLIDING SESSION RENEWAL: If the user has a valid session and the token
    //    is past 50% of its TTL, transparently re-issue a fresh 30-day cookie.
    //    This ensures active users are NEVER auto-logged-out.
    if (session && token) {
      const renewalCookie = await buildRenewalCookie(session);
      if (renewalCookie) {
        const response = NextResponse.next();
        response.headers.append("Set-Cookie", renewalCookie);
        return response;
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware Error]", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/issues/report",
    "/staff/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
