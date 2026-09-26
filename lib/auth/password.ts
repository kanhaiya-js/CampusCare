import bcrypt from "bcryptjs";

// Production cost factor: 12 salt rounds (defense-in-depth against GPU cracking)
const SALT_ROUNDS = 12;

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "admin123",
  "12345678",
  "123456789",
  "qwerty123",
  "glbitm123",
  "campuscare",
  "smartcampus",
]);

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password complexity against OWASP guidelines:
 * - Minimum 8 characters
 * - Maximum 128 characters (prevent DoS)
 * - Must contain at least one letter
 * - Must contain at least one number or special character
 * - Not in common dictionary / default list
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }

  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one number or special character");
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase().trim())) {
    errors.push("This password is too common and easily guessed. Please choose a stronger password");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Securely hashes password using bcrypt with cost factor 12.
 */
export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies candidate password against bcrypt hash in constant time.
 * Note: No shortcuts, backdoors, or test password bypasses are permitted.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
