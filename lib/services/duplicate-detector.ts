/**
 * Intelligent Duplicate Detection Engine
 * Combines token overlap, Jaccard similarity, and location/category context
 * to provide an explainable match score (0 to 1).
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is",
  "are", "was", "were", "it", "this", "that", "my", "our", "there", "has",
  "have", "had", "been", "be", "not", "no", "with", "from", "by", "room",
  "floor", "block", "building", "hall"
]);

export interface PotentialDuplicateMatch {
  issueId: string;
  publicIssueId: string;
  title: string;
  description: string;
  categoryName: string;
  locationName: string;
  room?: string | null;
  status: string;
  createdAt: Date | string;
  similarityScore: number;
  explanation: string[];
}

export function tokenizeText(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionSize = 0;
  Array.from(setA).forEach((item) => {
    if (setB.has(item)) {
      intersectionSize++;
    }
  });
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

export function evaluateSimilarity(
  newIssue: {
    title: string;
    description: string;
    categoryId?: string | null;
    locationId?: string | null;
    room?: string | null;
  },
  existingIssue: {
    id: string;
    publicIssueId: string;
    title: string;
    description: string;
    categoryId: string;
    categoryName: string;
    locationId: string;
    locationName: string;
    room?: string | null;
    status: string;
    createdAt: Date | string;
  }
): PotentialDuplicateMatch | null {
  const explanations: string[] = [];
  let score = 0;

  // 1. Location match
  const sameLocation = newIssue.locationId && newIssue.locationId === existingIssue.locationId;
  const sameRoom =
    newIssue.room &&
    existingIssue.room &&
    newIssue.room.trim().toLowerCase() === existingIssue.room.trim().toLowerCase();

  if (sameLocation && sameRoom) {
    score += 0.4;
    explanations.push(`Identical location and room (${existingIssue.locationName}, Room ${existingIssue.room})`);
  } else if (sameLocation) {
    score += 0.25;
    explanations.push(`Matching campus facility/building (${existingIssue.locationName})`);
  } else if (sameRoom) {
    score += 0.2;
    explanations.push(`Matching room identifier (${newIssue.room})`);
  }

  // 2. Category match
  const sameCategory = newIssue.categoryId && newIssue.categoryId === existingIssue.categoryId;
  if (sameCategory) {
    score += 0.2;
    explanations.push(`Identical issue category (${existingIssue.categoryName})`);
  }

  // 3. Text content similarity (Title + Description tokens)
  const newTokens = tokenizeText(`${newIssue.title} ${newIssue.description}`);
  const existingTokens = tokenizeText(`${existingIssue.title} ${existingIssue.description}`);
  const textSimilarity = calculateJaccardSimilarity(newTokens, existingTokens);

  if (textSimilarity > 0.4) {
    score += 0.45;
    const sharedTokens = Array.from(newTokens).filter((t) => existingTokens.has(t));
    explanations.push(`Strong keyword match: [${sharedTokens.slice(0, 4).join(", ")}]`);
  } else if (textSimilarity > 0.2) {
    score += 0.25;
    const sharedTokens = Array.from(newTokens).filter((t) => existingTokens.has(t));
    explanations.push(`Moderate keyword overlap: [${sharedTokens.slice(0, 3).join(", ")}]`);
  }

  // Normalize score between 0 and 1
  const finalScore = Math.min(1, Math.round(score * 100) / 100);

  // Threshold: only return if score >= 0.40
  if (finalScore >= 0.4) {
    return {
      issueId: existingIssue.id,
      publicIssueId: existingIssue.publicIssueId,
      title: existingIssue.title,
      description: existingIssue.description,
      categoryName: existingIssue.categoryName,
      locationName: existingIssue.locationName,
      room: existingIssue.room,
      status: existingIssue.status,
      createdAt: existingIssue.createdAt,
      similarityScore: finalScore,
      explanation: explanations,
    };
  }

  return null;
}
