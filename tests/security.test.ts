import { describe, it, expect } from "vitest";
import { validatePasswordStrength, hashPassword, verifyPassword } from "../lib/auth/password";
import { sanitizeText, stripHtml, escapeHtml, sanitizeFileName, isSafeRedirectUrl } from "../lib/security/sanitize";
import { checkRateLimit, recordFailedAttempt, isAccountLocked, resetFailedAttempts } from "../lib/security/rate-limit";
import { validateCsrfOrigin } from "../lib/security/csrf";
import { NextRequest } from "next/server";

describe("Security Architecture - Password Hashing & Complexity", () => {
  it("should validate strong passwords meeting OWASP guidelines", () => {
    const result = validatePasswordStrength("SecureP@ssw0rd2026");
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should reject passwords that are too short", () => {
    const result = validatePasswordStrength("Ab1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters long");
  });

  it("should reject passwords missing numbers or special characters", () => {
    const result = validatePasswordStrength("AllLettersOnly");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one number or special character");
  });

  it("should reject common easily-guessed dictionary passwords", () => {
    const result = validatePasswordStrength("password123");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("too common");
  });

  it("should hash and verify passwords using bcrypt without backdoors", async () => {
    const plain = "RobustGlbPassword99#";
    const hash = await hashPassword(plain);
    expect(hash).toMatch(/^\$2[aby]\$12\$/); // Cost factor 12

    const valid = await verifyPassword(plain, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("WrongPassword123!", hash);
    expect(invalid).toBe(false);
  });
});

describe("Security Architecture - XSS Prevention & Input Sanitization", () => {
  it("should strip malicious script tags and event handlers from text", () => {
    const malicious = "<script>alert('xss')</script>Broken pipe on floor 2";
    const sanitized = sanitizeText(malicious);
    expect(sanitized).toBe("Broken pipe on floor 2");
    expect(sanitized).not.toContain("<script>");
  });

  it("should encode HTML characters in user content", () => {
    const dangerous = '<b>bold</b> & "quoted"';
    const escaped = escapeHtml(dangerous);
    expect(escaped).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt; &amp; &quot;quoted&quot;");
  });

  it("should sanitize filenames and eliminate path traversal attacks", () => {
    const attack = "../../../etc/passwd.jpg";
    const clean = sanitizeFileName(attack);
    expect(clean).not.toContain("..");
    expect(clean).not.toContain("/");
    expect(clean).toBe("______etc_passwd.jpg");
  });

  it("should validate safe and unsafe redirect URLs", () => {
    expect(isSafeRedirectUrl("/dashboard")).toBe(true);
    expect(isSafeRedirectUrl("/issues/report")).toBe(true);
    expect(isSafeRedirectUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeRedirectUrl("//evil.com")).toBe(false);
    expect(isSafeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });
});

describe("Security Architecture - Rate Limiting & Account Lockout", () => {
  it("should enforce sliding window rate limits", () => {
    const testKey = `test_limit_${Date.now()}`;
    const opts = { limit: 3, windowMs: 10000 };

    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);
    expect(checkRateLimit(testKey, opts).allowed).toBe(true);

    const exceeded = checkRateLimit(testKey, opts);
    expect(exceeded.allowed).toBe(false);
    expect(exceeded.remaining).toBe(0);
    expect(exceeded.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should trigger account lockout after 5 consecutive failed attempts", () => {
    const email = `victim_${Date.now()}@glbitm.edu`;

    for (let i = 0; i < 4; i++) {
      const res = recordFailedAttempt(email, 5, 60000);
      expect(res.locked).toBe(false);
    }

    // 5th attempt locks the account
    const fifth = recordFailedAttempt(email, 5, 60000);
    expect(fifth.locked).toBe(true);

    // Subsequent status check confirms lockout
    const status = isAccountLocked(email);
    expect(status.locked).toBe(true);
    expect(status.remainingSeconds).toBeGreaterThan(0);

    // Resetting clears lockout state
    resetFailedAttempts(email);
    expect(isAccountLocked(email).locked).toBe(false);
  });
});

describe("Security Architecture - CSRF & Origin Validation", () => {
  it("should allow safe GET requests regardless of origin", () => {
    const req = new NextRequest("http://localhost:3000/api/issues", {
      method: "GET",
    });
    const result = validateCsrfOrigin(req);
    expect(result.valid).toBe(true);
  });

  it("should allow mutating requests with matching Origin", () => {
    const req = new NextRequest("http://localhost:3000/api/issues", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.valid).toBe(true);
  });

  it("should reject mutating requests from external untrusted origins", () => {
    const req = new NextRequest("http://localhost:3000/api/issues", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://attacker-site.com",
      },
    });
    const result = validateCsrfOrigin(req);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("attacker-site.com");
  });
});
