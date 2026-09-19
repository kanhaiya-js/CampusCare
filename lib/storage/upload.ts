import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

// SECURITY (V5): Magic byte signatures for file type validation
// Prevents MIME spoofing attacks where a malicious file claims to be an image
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF....WEBP)
  "video/mp4": [
    [0x00, 0x00, 0x00], // MP4 ftyp box (variable 4th byte)
  ],
  "video/quicktime": [
    [0x00, 0x00, 0x00], // MOV also uses ftyp boxes
  ],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  for (const sig of signatures) {
    if (buffer.length < sig.length) continue;
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

// SECURITY (V6): Sanitize original filename to prevent XSS and path traversal
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "_") // Remove special chars
    .replace(/\.\./g, "_")                // Prevent path traversal
    .replace(/\s+/g, "_")                 // Replace spaces
    .slice(0, 200);                        // Limit length
}

export interface SaveFileResult {
  url: string;
  fileName: string;
  fileSize: number;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
}

export async function saveUploadedFile(file: File): Promise<SaveFileResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 10MB limit (size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  if (file.size === 0) {
    throw new Error("Empty file upload is not allowed");
  }

  const mimeType = file.type.toLowerCase();
  const ext = ALLOWED_MIME_TYPES[mimeType];

  if (!ext) {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed formats: JPG, PNG, WEBP, MP4, PDF.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // SECURITY (V5): Validate file content matches claimed MIME type
  if (!validateMagicBytes(buffer, mimeType)) {
    throw new Error(
      "File content does not match the declared file type. The file may be corrupted or incorrectly labeled."
    );
  }

  let fileCategory: "IMAGE" | "VIDEO" | "DOCUMENT" = "DOCUMENT";
  if (mimeType.startsWith("image/")) fileCategory = "IMAGE";
  else if (mimeType.startsWith("video/")) fileCategory = "VIDEO";

  const randomName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  // Ensure public/uploads exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const targetPath = path.join(uploadDir, randomName);
  fs.writeFileSync(targetPath, buffer);

  return {
    url: `/uploads/${randomName}`,
    fileName: sanitizeFileName(file.name), // V6: Sanitized filename
    fileSize: file.size,
    type: fileCategory,
  };
}
