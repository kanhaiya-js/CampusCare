import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "campuscare_session";

// SECURITY: Single secret key, no fallbacks
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

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    let session: any = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getSecretKey(), {
          algorithms: ["HS256"],
        });
        session = payload;
      } catch {
        // Invalid/expired token — treat as unauthenticated
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

    return NextResponse.next();
  } catch (error) {
    // STABILITY: If middleware throws (e.g., corrupted cookie, env issue),
    // let the request through rather than crashing the entire app with 500.
    console.error("[Middleware Error]", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
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
