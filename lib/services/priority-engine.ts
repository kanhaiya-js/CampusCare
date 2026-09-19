export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface PriorityAssessmentInput {
  title: string;
  description: string;
  categoryName?: string;
  defaultCategoryPriority?: PriorityLevel;
}

export interface PriorityAssessmentResult {
  priority: PriorityLevel;
  confidence: number;
  reasons: string[];
}

const CRITICAL_KEYWORDS = [
  "fire",
  "spark",
  "sparks",
  "burning",
  "smoke",
  "gas leak",
  "electric shock",
  "short circuit",
  "live wire",
  "exposed wire",
  "structural collapse",
  "ceiling falling",
  "flooding",
  "severe flood",
  "explosion",
  "danger",
  "hazardous",
  "hazard",
  "emergency",
  "trapped in elevator",
  "elevator stuck",
];

const HIGH_KEYWORDS = [
  "leak",
  "leaking",
  "pipe burst",
  "water overflow",
  "no water",
  "blackout",
  "power outage",
  "broken glass",
  "ac water",
  "mold",
  "door lock jammed",
  "stuck lock",
  "security breach",
  "slippery floor",
  "broken stairs",
  "washroom overflow",
  "sewage",
];

const LOW_KEYWORDS = [
  "flicker",
  "paint peeling",
  "dusty",
  "squeaky",
  "loose screw",
  "scratched",
  "cosmetic",
  "poster",
  "chair height",
  "whiteboard marker",
  "clock battery",
];

export function calculateIssuePriority(input: PriorityAssessmentInput): PriorityAssessmentResult {
  const text = `${input.title} ${input.description}`.toLowerCase();
  const reasons: string[] = [];

  // 1. Check for Critical life-safety hazards
  for (const kw of CRITICAL_KEYWORDS) {
    if (text.includes(kw)) {
      reasons.push(`Contains critical hazard indicator: "${kw}"`);
    }
  }
  if (reasons.length > 0) {
    return {
      priority: "CRITICAL",
      confidence: 0.95,
      reasons,
    };
  }

  // 2. Check for High impact issues
  for (const kw of HIGH_KEYWORDS) {
    if (text.includes(kw)) {
      reasons.push(`Contains high-urgency indicator: "${kw}"`);
    }
  }
  if (reasons.length > 0) {
    return {
      priority: "HIGH",
      confidence: 0.85,
      reasons,
    };
  }

  // 3. Category defaults
  if (input.categoryName) {
    const cat = input.categoryName.toLowerCase();
    if (cat.includes("safety") || cat.includes("security")) {
      return {
        priority: "HIGH",
        confidence: 0.8,
        reasons: [`Category "${input.categoryName}" defaults to high urgency`],
      };
    }
    if (cat.includes("electrical") || cat.includes("plumbing")) {
      return {
        priority: "HIGH",
        confidence: 0.75,
        reasons: [`Infrastructural category "${input.categoryName}" requires prompt attention`],
      };
    }
    if (cat.includes("furniture") || cat.includes("cosmetic")) {
      return {
        priority: "LOW",
        confidence: 0.75,
        reasons: [`Maintenance category "${input.categoryName}" is typically non-disruptive`],
      };
    }
  }

  // 4. Low indicators
  for (const kw of LOW_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        priority: "LOW",
        confidence: 0.7,
        reasons: [`Contains minor maintenance indicator: "${kw}"`],
      };
    }
  }

  // 5. Fallback to category default or MEDIUM
  const fallback = input.defaultCategoryPriority || "MEDIUM";
  return {
    priority: fallback,
    confidence: 0.6,
    reasons: [`Default baseline priority for category`],
  };
}
