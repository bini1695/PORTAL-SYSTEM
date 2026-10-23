import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FacultyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getMySections(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      select: { id: true, department: true, user: { include: { profile: true } } },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const sections = await this.prisma.section.findMany({
      where: { instructorId: faculty.id },
      include: {
        course: true,
        enrollments: {
          select: { id: true, status: true, grade: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalStudents = 0;
    let pendingGrades = 0;

    sections.forEach((sec: any) => {
      const active = sec.enrollments.filter((e: any) => e.status === 'ENROLLED');
      totalStudents += active.length;
      pendingGrades += active.filter((e: any) => !e.grade).length;
    });

    return {
      facultyName: `${faculty.user.profile?.firstName || ''} ${faculty.user.profile?.lastName || ''}`.trim() || 'Faculty Member',
      department: faculty.department,
      totalCourses: sections.length,
      totalStudents,
      pendingGrades,
      sections,
    };
  }

  async getSectionRoster(userId: string, sectionId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        enrollments: {
          where: { status: 'ENROLLED' }, // የተመዘገቡ ብቻ
          include: {
            student: { include: { user: { include: { profile: true } } } },
          },
          orderBy: {
            student: { studentNumber: 'asc' }
          }
        },
      },
    });

    if (!section) throw new NotFoundException('Section not found');
    if (section.instructorId !== faculty.id) {
      throw new ForbiddenException('You do not teach this section');
    }

    return section;
  }

  async submitGrade(userId: string, enrollmentId: string, grade: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { section: { select: { instructorId: true } } },
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
      userId,
      action: 'GRADE_SUBMITTED',
      entity: 'Enrollment',
      entityId: enrollmentId,
      metadata: { grade },
    });

    return updated;
  }
}