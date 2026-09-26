/**
 * Comprehensive Multi-Tier Rate Limiter & Brute-Force Protection
 * Defense-in-depth against credential stuffing, brute force, and denial-of-service.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  firstAttemptAt: number;
}

// In-memory sliding window cache with memory bounds
const MAX_CACHE_ENTRIES = 50000;
const rateLimitStore = new Map<string, RateLimitRecord>();
const lockoutStore = new Map<string, LockoutRecord>();

// Clean up expired records every 3 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  });

  lockoutStore.forEach((record, key) => {
    if (record.lockedUntil && now > record.lockedUntil) {
      lockoutStore.delete(key);
    } else if (!record.lockedUntil && now - record.firstAttemptAt > 60 * 60 * 1000) {
      lockoutStore.delete(key);
    }
  });
}, 3 * 60 * 1000);

export interface RateLimitOptions {
  limit?: number; // Max requests allowed
  windowMs?: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfterSeconds: number;
}

/**
 * Standard sliding-window rate limit checker.
 * Can be used with IP addresses, user IDs, or composite keys.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60 * 1000;
  const now = Date.now();

  // Guard against unbounded memory growth
  if (rateLimitStore.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest 1000 entries
    let count = 0;
    for (const key of rateLimitStore.keys()) {
      rateLimitStore.delete(key);
      if (++count >= 1000) break;
    }
  }

  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      retryAfterSeconds: retryAfter,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetTime - now) / 1000)),
  };
}

/**
 * Account Lockout / Failed Attempt Tracker (OWASP Authentication Defense)
 * Protects specific accounts (e.g. per-email) from targeted distributed brute-force attacks.
 */
export function isAccountLocked(identifier: string): { locked: boolean; remainingSeconds: number } {
  const record = lockoutStore.get(identifier.toLowerCase().trim());
  if (!record || !record.lockedUntil) {
    return { locked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  if (now >= record.lockedUntil) {
    // Lockout expired, clear lockout state
    record.lockedUntil = null;
    record.failedAttempts = 0;
    return { locked: false, remainingSeconds: 0 };
  }

  const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
  return { locked: true, remainingSeconds };
}

/**
 * Records a failed authentication attempt.
 * If failures exceed maxFailures (default 5), locks the identifier for lockoutMs (default 15 mins).
 */
export function recordFailedAttempt(
  identifier: string,
  maxFailures = 5,
  lockoutMs = 15 * 60 * 1000
): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = lockoutStore.get(key);

  if (!record) {
    lockoutStore.set(key, {
      failedAttempts: 1,
      lockedUntil: null,
      firstAttemptAt: now,
    });
    return { locked: false, remainingAttempts: maxFailures - 1, remainingSeconds: 0 };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      locked: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  record.failedAttempts += 1;

  if (record.failedAttempts >= maxFailures) {
    record.lockedUntil = now + lockoutMs;
    return {
      locked: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(lockoutMs / 1000),
    };
  }

  return {
    locked: false,
    remainingAttempts: maxFailures - record.failedAttempts,
    remainingSeconds: 0,
  };
}

/**
 * Resets failed attempt counter upon successful login.
 */
export function resetFailedAttempts(identifier: string): void {
  lockoutStore.delete(identifier.toLowerCase().trim());
}
