import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listAll() {
    const students = await this.prisma.student.findMany({
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((s) => ({
      id: s.id,
      studentNumber: s.studentNumber,
      program: s.program,
      status: s.status,
      createdAt: s.createdAt,
      user: {
        email: s.user.email,
        firstName: s.user.profile?.firstName || 'Unknown',
        lastName: s.user.profile?.lastName || '',
      },
    }));
  }

  async updateStatus(actorId: string, studentId: string, status: AccountStatus) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.student.update({ where: { id: studentId }, data: { status } });
    await this.prisma.user.update({ where: { id: student.userId }, data: { accountStatus: status } });

    await this.audit.record({
      userId: actorId,
      action: `STUDENT_STATUS_${status}`,
      entity: 'Student',
      entityId: studentId,
    });

    return { success: true };
  }
}