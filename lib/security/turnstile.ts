/**
 * Cloudflare Turnstile Server-Side Verification
 * Follows Cloudflare's canonical siteverify specification:
 * https://developers.cloudflare.com/turnstile/spin/prompt.md
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
  expectedAction?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Bypass during unit / integration tests to prevent network dependencies
  if (process.env.NODE_ENV === "test") {
    return { success: true };
  }

  const DEFAULT_SECRET_KEY = "0x4AAAAAAFEikJH4W1uMwP0F2ZwG2cXDxNU";
  const secretKey =
    process.env.TURNSTILE_SECRET ||
    process.env.TURNSTILE_SECRET_KEY ||
    DEFAULT_SECRET_KEY;

  // 2. Token length and type validation per canonical Cloudflare contract
  if (
    typeof token !== "string" ||
    token.trim().length === 0 ||
    token.length > 2048
  ) {
    return {
      success: false,
      error: "Please complete the Cloudflare security verification challenge.",
    };
  }

  // 3. Expected hostnames filter (if configured in environment)
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
  );

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
      formData.append("remoteip", remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("[Turnstile] Cloudflare siteverify HTTP error:", response.status, response.statusText);
      return {
        success: false,
        error: "Unable to verify security challenge with Cloudflare. Please try again.",
      };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      console.warn("[Turnstile] Verification failed with codes:", errorCodes);
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    // 4. Validate action if expected
    if (expectedAction && data.action && data.action !== expectedAction) {
      console.warn("[Turnstile] Action mismatch:", { received: data.action, expected: expectedAction });
      return {
        success: false,
        error: "Security verification action mismatch.",
      };
    }

    // 5. Validate hostname if hostnames allowlist is configured
    if (expectedHostnames.size > 0 && data.hostname && !expectedHostnames.has(data.hostname)) {
      console.warn("[Turnstile] Hostname mismatch:", { received: data.hostname, expected: Array.from(expectedHostnames) });
      return {
        success: false,
        error: "Security verification hostname mismatch.",
      };
    }

    return { success: true };
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.error("[Turnstile] Request timed out after 10s");
      return {
        success: false,
        error: "Security verification timed out. Please try again.",
      };
    }
    console.error("[Turnstile] Unexpected verification exception:", err);
    return {
      success: false,
      error: "Security verification service encountered a network error. Please try again.",
    };
  }
}
