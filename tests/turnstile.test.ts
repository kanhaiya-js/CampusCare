import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstileToken } from "../lib/security/turnstile";

describe("Cloudflare Turnstile Verification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should bypass verification in test environment", async () => {
    process.env.NODE_ENV = "test";
    const result = await verifyTurnstileToken("dummy-token");
    expect(result.success).toBe(true);
  });

  it("should reject when token is missing in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret-mock";

    const result = await verifyTurnstileToken("");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Please complete");
  });

  it("should validate successfully when Cloudflare returns success: true", async () => {
    process.env.NODE_ENV = "production";
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret-mock";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        challenge_ts: new Date().toISOString(),
        hostname: "example.com",
      }),
    } as any);

    const result = await verifyTurnstileToken("valid-cf-token", "1.2.3.4");
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should return failure when Cloudflare rejects the token", async () => {
    process.env.NODE_ENV = "production";
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret-mock";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    } as any);

    const result = await verifyTurnstileToken("invalid-token");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Security verification failed");
  });

  it("should handle network errors gracefully without crashing", async () => {
    process.env.NODE_ENV = "production";
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret-mock";

    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const result = await verifyTurnstileToken("token-under-network-drop");
    expect(result.success).toBe(false);
    expect(result.error).toContain("network error");
  });
});
