import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FacultyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getMyProfile(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      include: { user: { include: { profile: true } } },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  async mySections(userId: string) {
    const faculty = await this.getMyProfile(userId);
    return this.prisma.section.findMany({
      where: { instructorId: faculty.id },
      include: {
        course: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ academicYear: 'desc' }, { term: 'asc' }],
    });
  }

  async submitGrade(
    actorId: string,
    enrollmentId: string,
    grade: string,
  ) {
    const faculty = await this.getMyProfile(actorId);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { section: { select: { instructorId: true, id: true } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.section.instructorId !== faculty.id) {
      throw new ForbiddenException('You do not teach this section');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        grade,
        status: grade === 'F' ? 'FAILED' : 'COMPLETED',
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'GRADE_SUBMITTED',
      entity: 'Enrollment',
      entityId: enrollmentId,
      metadata: { grade },
    });
    return updated;
  }
}