import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] | string } }
) {
  try {
    const rawPath = params?.path;
    if (!rawPath || (Array.isArray(rawPath) && rawPath.length === 0)) {
      return new NextResponse("File path required", { status: 400 });
    }

    const segments = Array.isArray(rawPath) ? rawPath : [rawPath];
    // Sanitize to prevent path traversal
    const requestedFile = segments.map((s) => path.basename(s)).join(path.sep);

    // Search in public/uploads first, then fallback to uploads
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", requestedFile),
      path.join(process.cwd(), "uploads", requestedFile),
    ];

    let targetPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        targetPath = p;
        break;
      }
    }

    if (!targetPath) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const fileBuffer = fs.readFileSync(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("[Upload Route] Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { path?: string[] | string } }
) {
  const getRes = await GET(req, { params });
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
