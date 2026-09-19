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

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    let sanitizedMetadata: string | undefined = undefined;
    if (params.metadata) {
      // Remove any sensitive keys if accidentally present
      const copy = { ...params.metadata };
      delete copy.password;
      delete copy.passwordHash;
      delete copy.token;
      delete copy.secret;
      sanitizedMetadata = JSON.stringify(copy);
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
