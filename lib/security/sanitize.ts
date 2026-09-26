/**
 * Comprehensive Input Sanitization and XSS Prevention Utility
 * Defense-in-depth: Never trust client input, sanitize all persisted text.
 */

// HTML entity map for escaping
const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes HTML characters to prevent Stored & Reflected XSS.
 * Safe for inserting user text into HTML contexts.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITY_MAP[match] || match);
}

/**
 * Strips all HTML tags, script/style content, and control characters from text.
 * Used for plain-text fields like titles, names, IDs, comments.
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Strip script tag and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Strip style tag and contents
    .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "") // Remove ASCII control characters
    .trim();
}

/**
 * Sanitizes user-provided text for safe storage.
 * Strips control characters, normalizes whitespace, and escapes dangerous sequences.
 */
export function sanitizeText(str: string, maxLength = 5000): string {
  if (!str || typeof str !== "string") return "";
  const cleaned = stripHtml(str);
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes filenames to prevent path traversal and arbitrary file write attacks.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") return "attachment";
  return fileName
    .replace(/\0/g, "") // Null bytes
    .replace(/\.\./g, "_") // Path traversal
    .replace(/[\/\\]/g, "_") // Slashes
    .replace(/[^a-zA-Z0-9._\-\s]/g, "_") // Safe chars only
    .trim()
    .slice(0, 150);
}

/**
 * Validates that a URL is safe to redirect to or display (prevents open redirects & javascript: pseudo-protocol).
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // Disallow javascript:, data:, vbscript: schemes
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return false;
  }
  // Allow relative URLs starting with / (excluding // which is protocol-relative external redirect)
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }
  return false;
}
