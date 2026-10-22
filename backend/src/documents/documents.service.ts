import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listForStudent(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!student) throw new ForbiddenException('Student profile not found');
    return this.prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createForStudent(userId: string, dto: CreateDocumentDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!student) throw new ForbiddenException('Student profile not found');

    const doc = await this.prisma.document.create({
      data: {
        studentId: student.id,
        type: dto.type,
        url: dto.url,
        note: dto.note,
      },
    });
    await this.audit.record({
      userId,
      action: 'DOCUMENT_UPLOADED',
      entity: 'Document',
      entityId: doc.id,
    });
    return doc;
  }
}