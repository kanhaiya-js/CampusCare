/**
 * Avatar utility module for SmartCampus
 * Generates and sanitizes clean, professional, simple cartoon avatars.
 * Uses DiceBear's avataaars collection with soft, pleasant background palettes.
 */

const DEFAULT_BG = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";

/**
 * Returns a high-quality, professional, simple cartoon avatar URL.
 */
export function getAvatarUrl(seed?: string | null, customBg?: string): string {
  const safeSeed = encodeURIComponent(seed?.trim() || "User");
  const bg = customBg || DEFAULT_BG;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeSeed}&backgroundColor=${bg}`;
}

/**
 * Sanitizes existing avatar URLs. Automatically upgrades legacy cartoon styles
 * (like adventurer) to the clean, professional avataaars cartoon style.
 */
export function sanitizeAvatarUrl(url?: string | null, fallbackSeed?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return getAvatarUrl(fallbackSeed);
  }

  // Upgrade legacy DiceBear styles (e.g. adventurer) to professional cartoon avataaars
  if (url.includes("/adventurer/")) {
    return url.replace("/adventurer/", "/avataaars/");
  }

  return url;
}
