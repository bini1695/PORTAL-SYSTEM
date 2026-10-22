import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateHoldDto } from './dto/create-hold.dto';

@Injectable()
export class HoldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(actorId: string, dto: CreateHoldDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const hold = await this.prisma.hold.create({
      data: { studentId: dto.studentId, type: dto.type, reason: dto.reason },
    });
    await this.audit.record({
      userId: actorId,
      action: 'HOLD_CREATED',
      entity: 'Hold',
      entityId: hold.id,
    });
    return hold;
  }

  async resolve(actorId: string, holdId: string) {
    const hold = await this.prisma.hold.findUnique({ where: { id: holdId } });
    if (!hold) throw new NotFoundException('Hold not found');

    const updated = await this.prisma.hold.update({
      where: { id: holdId },
      data: { active: false, resolvedAt: new Date() },
    });
    await this.audit.record({
      userId: actorId,
      action: 'HOLD_RESOLVED',
      entity: 'Hold',
      entityId: holdId,
    });
    return updated;
  }

  async list(filter?: { studentId?: string; active?: boolean }) {
    return this.prisma.hold.findMany({
      where: filter,
      include: {
        student: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}