import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // 1. ነባሩ የ 'log' ፋንክሽን (ለአዲሶቹ ኮዶች የሚያገለግል)
  async log(userId: string, action: string, entity: string, entityId: string, metadata?: any) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          entity,
          entityId,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // 2. የድሮው ኮድ እንዲሰራ 'record' የሚል ፋንክሽን (Object ይቀበላል)
  async record(data: { userId?: string; action: string; entity: string; entityId?: string; metadata?: any }) {
    return this.log(data.userId || 'system', data.action, data.entity, data.entityId || '', data.metadata);
  }

  // 3. በ Transaction ውስጥ ለመመዝገብ 'recordInTx' የሚል ፋንክሽን
  async recordInTx(tx: Prisma.TransactionClient, data: { userId?: string; action: string; entity: string; entityId?: string; metadata?: any }) {
    try {
      return await tx.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId || '',
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      console.error('Failed to create audit log in tx:', error);
    }
  }

  // 4. ሎጎችን ለማምጣት (ለ Frontend Audit Logs ገጽ)
  async findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        user: {
          select: { email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}