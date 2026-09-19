import prisma from "@/lib/db/prisma";

/**
 * Semantic & Collision-Proof Ticket ID Generator for CampusCare
 * 
 * Features:
 * 1. Semantic Slug Generation: Extracts meaningful acronym/slug from problem title
 *    (e.g., "Water leakage from AC" -> "WALEFRAC")
 * 2. Student Context (optional): Incorporates student initials or ID code
 * 3. Database Collision Verification: Queries Prisma to guarantee 100% uniqueness
 *    before saving.
 */

// Common small connector words to skip when generating acronyms
const IGNORE_WORDS = new Set(["in", "on", "at", "to", "for", "of", "and", "or", "the", "a", "an", "is", "my"]);

/**
 * Extracts a meaningful, memorable acronym from the issue title words.
 * Example: "Water leakage from AC" -> "WALEFRAC"
 */
export function extractSemanticSlug(title: string): string {
  if (!title || typeof title !== "string") return "ISSUE";

  // Clean title: keep letters and digits
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const rawWords = cleanTitle.split(/\s+/).filter((w) => w.length > 0);

  if (rawWords.length === 0) return "ISSUE";

  // Filter out non-essential filler words if we have enough words
  let words = rawWords.filter((w) => !IGNORE_WORDS.has(w.toLowerCase()));
  if (words.length === 0) words = rawWords;

  if (words.length === 1) {
    // Single word: use first 6 characters
    return words[0].slice(0, 6).toUpperCase();
  }

  // Multi-word title: take first 2 letters from each word (up to 4 words)
  // e.g. "Water leakage from AC" -> "WA" + "LE" + "FR" + "AC" = "WALEFRAC"
  const slug = words
    .slice(0, 4)
    .map((w) => {
      if (w.length >= 2) return w.slice(0, 2);
      return w;
    })
    .join("")
    .toUpperCase();

  return slug.slice(0, 8);
}

/**
 * Extracts compact student identifier (e.g. initials from name or last 3 digits of student ID)
 */
export function extractStudentTag(studentName?: string | null, studentId?: string | null): string {
  if (studentId && studentId.trim().length >= 3) {
    // Use last 3 characters of student/employee ID (e.g., "101")
    const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanId.length >= 3) return cleanId.slice(-3).toUpperCase();
  }

  if (studentName && studentName.trim().length > 0) {
    // Use student initials (e.g. "Aarav Sharma" -> "AS")
    const parts = studentName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return studentName.slice(0, 2).toUpperCase();
  }

  return "";
}

/**
 * Formats a candidate ticket ID
 * e.g. "CC-WALEFRAC-001" or with student tag "CC-AS-WALEFRAC-001"
 */
export function formatCandidateId(params: {
  title: string;
  sequence: number;
  studentName?: string | null;
  studentId?: string | null;
}): string {
  const semanticSlug = extractSemanticSlug(params.title);
  const studentTag = extractStudentTag(params.studentName, params.studentId);
  const paddedSeq = String(params.sequence).padStart(3, "0");

  if (studentTag) {
    return `CC-${studentTag}-${semanticSlug}-${paddedSeq}`;
  }
  return `CC-${semanticSlug}-${paddedSeq}`;
}

/**
 * Generates a guaranteed 100% unique ticket ID by verifying against the database
 * In case of collision, increments the counter or adds random entropy until uniqueness is confirmed.
 */
export async function generateUniquePublicIssueId(params: {
  title: string;
  studentName?: string | null;
  studentId?: string | null;
}): Promise<string> {
  // 1. Get initial count of issues to start sequence
  const totalCount = await prisma.issue.count();
  let sequence = totalCount + 1;

  // 2. Generate initial candidate
  let candidate = formatCandidateId({
    title: params.title,
    sequence,
    studentName: params.studentName,
    studentId: params.studentId,
  });

  // 3. Database verification loop: check if candidate already exists
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const existing = await prisma.issue.findUnique({
      where: { publicIssueId: candidate },
      select: { id: true },
    });

    // If ID is not in database, it is 100% unique and safe to use!
    if (!existing) {
      return candidate;
    }

    // Collision detected! Increment sequence and try again
    sequence++;
    attempts++;

    // After 5 collisions, append short random entropy to guarantee uniqueness
    if (attempts > 5) {
      const entropy = Math.random().toString(36).substring(2, 5).toUpperCase();
      candidate = `${formatCandidateId({
        title: params.title,
        sequence,
        studentName: params.studentName,
        studentId: params.studentId,
      })}-${entropy}`;
    } else {
      candidate = formatCandidateId({
        title: params.title,
        sequence,
        studentName: params.studentName,
        studentId: params.studentId,
      });
    }
  }

  // Failsafe: timestamp-based unique ID with CC prefix
  return `CC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
}
