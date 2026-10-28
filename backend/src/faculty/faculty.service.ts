import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FacultyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getAllFaculty() {
    return this.prisma.faculty.findMany({
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  // 👇 ለፊት ገጹ (Overview) የሚያገለግል አዲስ ፈንክሽን
  async getOverview(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      select: { id: true, department: true, user: { include: { profile: true } } },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    // ሴክሽኖችን እና በውስጣቸው ያሉ ተማሪዎችን ማምጣት
    const sections = await this.prisma.section.findMany({
      where: { instructorId: faculty.id },
      include: {
        course: { select: { code: true, title: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const totalStudents = sections.reduce((sum, sec) => sum + sec._count.enrollments, 0);

    // የቅርብ ጊዜ ምዝገባዎችን ማምጣት
    const recentEnrollments = await this.prisma.enrollment.findMany({
      where: { section: { instructorId: faculty.id } },
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        student: { include: { user: { include: { profile: true } } } },
        section: { include: { course: true } },
      },
    });

    const recentActivity = recentEnrollments.map((e) => ({
      id: e.id,
      studentName: `${e.student.user.profile?.firstName || ''} ${e.student.user.profile?.lastName || ''}`.trim() || 'Unknown Student',
      course: e.section.course.code,
      date: e.enrolledAt,
    }));

    return {
      facultyName: `${faculty.user.profile?.firstName || ''} ${faculty.user.profile?.lastName || ''}`.trim() || 'Faculty Member',
      department: faculty.department,
      totalSections: sections.length,
      totalStudents,
      sections: sections.map((s) => ({
        id: s.id,
        code: s.course.code,
        title: s.course.title,
        sectionCode: s.sectionCode,
        students: s._count.enrollments,
        room: s.room,
      })),
      recentActivity,
    };
  }

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
          where: { status: 'ENROLLED' },
          include: { student: { include: { user: { include: { profile: true } } } } },
        },
      },
    });

    if (!section) throw new NotFoundException('Section not found');
    if (section.instructorId !== faculty.id) throw new ForbiddenException('You do not teach this section');
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
    if (enrollment.section.instructorId !== faculty.id) throw new ForbiddenException('You do not teach this section');

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { grade, status: grade === 'F' ? 'FAILED' : 'COMPLETED' },
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