import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  async log(userId: string, action: string, target: string | null, result: string) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        result,
      }
    });
  }
}
