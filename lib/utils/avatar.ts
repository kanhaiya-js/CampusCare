/**
 * Avatar utility module for SmartCampus — GL Bajaj Institute of Technology & Management.
 * Generates and sanitizes clean, dignified, professional enterprise-grade monogram/initials avatars.
 * Strictly avoids cartoon, comic, or playful styles in favor of serious production aesthetics.
 */

// Dignified institutional color palette (Navy Blue, Deep Teal, Indigo, Slate, Forest Emerald, Royal Sapphire)
const INSTITUTIONAL_PALETTE = [
  "1e3a8a", // Navy Blue
  "0f766e", // Deep Teal
  "312e81", // Indigo
  "1e293b", // Slate
  "115e59", // Dark Cyan
  "0369a1", // Ocean Sapphire
  "4338ca", // Royal Violet
  "15803d", // Emerald Green
  "334155", // Charcoal Slate
];

/**
 * Returns a sleek, professional enterprise monogram/initials avatar URL.
 */
export function getAvatarUrl(seed?: string | null, customBg?: string): string {
  // If seed is camelCase (e.g. "PrabhatSir"), separate words to get correct initials ("PS")
  let cleanSeed = (seed || "Campus User").trim();
  cleanSeed = cleanSeed.replace(/([a-z])([A-Z])/g, "$1 $2");

  const safeSeed = encodeURIComponent(cleanSeed);
  const bg = customBg || INSTITUTIONAL_PALETTE.join(",");

  return `https://api.dicebear.com/7.x/initials/svg?seed=${safeSeed}&radius=50&backgroundColor=${bg}&textColor=ffffff&fontWeight=600&fontSize=42`;
}

/**
 * Generates an offline-safe SVG data URL for professional monogram initials.
 */
export function getInitialsSvgDataUrl(name: string, bgColorHex = "1e3a8a"): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  let initials = "U";
  if (parts.length === 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="#${bgColorHex}" rx="50"/>
    <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="40" font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Sanitizes existing avatar URLs.
 * Strictly intercepts and replaces any cartoon, comic, or playful styles
 * (such as avataaars, adventurer, bottts, fun-emoji) with the clean, professional monogram style.
 */
export function sanitizeAvatarUrl(url?: string | null, fallbackSeed?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return getAvatarUrl(fallbackSeed);
  }

  // Detect and purge cartoon / comedic styles
  const isCartoonStyle =
    url.includes("/avataaars/") ||
    url.includes("/adventurer/") ||
    url.includes("/bottts/") ||
    url.includes("/pixel-art/") ||
    url.includes("/fun-emoji/") ||
    url.includes("/lorelei/") ||
    url.includes("/croodles/") ||
    url.includes("/micah/") ||
    url.includes("/thumbs/") ||
    url.includes("/open-peeps/");

  if (isCartoonStyle) {
    try {
      const parsedUrl = new URL(url);
      const seedParam = parsedUrl.searchParams.get("seed");
      return getAvatarUrl(seedParam || fallbackSeed);
    } catch {
      return getAvatarUrl(fallbackSeed);
    }
  }

  return url;
}

/**
 * Image onError event handler that automatically falls back to an inline SVG monogram
 * if the avatar image fails to load.
 */
export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement, Event>, name?: string) {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = getInitialsSvgDataUrl(name || "User");
}


