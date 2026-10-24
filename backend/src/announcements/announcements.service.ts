import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.announcement.findMany({
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(authorId: string, title: string, content: string) {
    const announcement = await this.prisma.announcement.create({
      data: { title, content, authorId },
    });
    await this.audit.record({
      userId: authorId,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'Announcement',
      entityId: announcement.id,
    });
    return announcement;
  }

  async remove(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return this.prisma.announcement.delete({ where: { id } });
  }
}