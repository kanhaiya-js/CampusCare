/**
 * Cloudflare Turnstile Server-Side Verification
 * Validates Turnstile challenge response tokens against Cloudflare's verification endpoint.
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
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Bypass during unit / integration tests to prevent network dependencies
  if (process.env.NODE_ENV === "test") {
    return { success: true };
  }

  const DEFAULT_SECRET_KEY = "0x4AAAAAAFEikJH4W1uMwP0F2ZwG2cXDxNU";
  const secretKey = process.env.TURNSTILE_SECRET_KEY || DEFAULT_SECRET_KEY;

  // 3. Ensure a token was provided
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      success: false,
      error: "Please complete the Cloudflare security verification challenge.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    });

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

    return { success: true };
  } catch (err: any) {
    console.error("[Turnstile] Unexpected verification exception:", err);
    return {
      success: false,
      error: "Security verification service encountered a network error. Please try again.",
    };
  }
}
