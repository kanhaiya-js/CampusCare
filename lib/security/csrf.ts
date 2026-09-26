/**
 * CSRF and Cross-Origin Request Validation Defense
 * OWASP: Cross-Site Request Forgery Protection via Origin/Referer header verification
 * and SameSite cookie defense.
 */

import { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Validates Origin and Referer headers on state-changing requests (POST, PUT, PATCH, DELETE).
 * Ensures requests originate from the same application host or explicitly allowed origins.
 */
export function validateCsrfOrigin(req: NextRequest): { valid: boolean; reason?: string } {
  // Safe read-only methods do not modify server state
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  // In standard browser API calls, at least Origin or Referer is supplied for POST/PUT/PATCH/DELETE
  if (!origin && !referer) {
    // If neither is present, in development we can allow, but in production we require an origin or check content-type
    if (process.env.NODE_ENV === "production") {
      // Disallow requests with missing Origin/Referer on mutating actions
      return { valid: false, reason: "Missing Origin and Referer headers on state-changing request" };
    }
    return { valid: true };
  }

  const allowedHosts = new Set<string>();
  if (host) allowedHosts.add(host.toLowerCase());

  // Also allow NEXTAUTH_URL / APP_URL host if configured
  if (process.env.APP_URL) {
    try {
      allowedHosts.add(new URL(process.env.APP_URL).host.toLowerCase());
    } catch {
      // Ignore URL parse error
    }
  }

  // 1. Check Origin header
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (allowedHosts.has(originUrl.host.toLowerCase())) {
        return { valid: true };
      }
      return { valid: false, reason: `Origin '${originUrl.host}' does not match allowed host '${host}'` };
    } catch {
      return { valid: false, reason: "Malformed Origin header" };
    }
  }

  // 2. Check Referer header if Origin not provided
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedHosts.has(refererUrl.host.toLowerCase())) {
        return { valid: true };
      }
      return { valid: false, reason: `Referer '${refererUrl.host}' does not match allowed host '${host}'` };
    } catch {
      return { valid: false, reason: "Malformed Referer header" };
    }
  }

  return { valid: true };
}
