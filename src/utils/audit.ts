import prisma from "../config/database";

export interface AuditLogData {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
}

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error("Failed to create audit log:", error);
  }
};

