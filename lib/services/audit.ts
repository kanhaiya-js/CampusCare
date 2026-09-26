import prisma from "@/lib/db/prisma";

export interface CreateAuditLogParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "newpassword",
  "currentpassword",
  "confirmpassword",
  "token",
  "tokenhash",
  "authtoken",
  "resettoken",
  "secret",
  "adminkey",
  "cookie",
  "authorization",
  "session",
]);

/**
 * Recursively redacts sensitive keys from audit log metadata.
 */
function sanitizeAuditObject(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeAuditObject);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitizeAuditObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    let sanitizedMetadata: string | undefined = undefined;
    if (params.metadata) {
      const clean = sanitizeAuditObject(params.metadata);
      sanitizedMetadata = JSON.stringify(clean);
    }

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: sanitizedMetadata,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
}
