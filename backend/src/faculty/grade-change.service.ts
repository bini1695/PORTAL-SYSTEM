import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service'; // 👈 አዲስ
import { Role } from '@prisma/client'; // 👈 አዲስ

@Injectable()
export class GradeChangeService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService, // 👈 አዲስ
  ) {}

  async requestChange(userId: string, enrollmentId: string, newGrade: string, reason: string) {
    const faculty = await this.prisma.faculty.findUnique({ 
      where: { userId },
      include: { user: { include: { profile: true } } } // 👈 ለስም ማሳያ
    });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { 
        section: { include: { course: true } },
        student: { include: { user: { include: { profile: true } } } } // 👈 ለስም ማሳያ
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.section.instructorId !== faculty.id) throw new BadRequestException('Not your section');

    const request = await this.prisma.gradeChangeRequest.create({
      data: {
        enrollmentId,
        facultyId: faculty.id,
        oldGrade: enrollment.grade || 'N/A',
        newGrade,
        reason,
      },
    });

    // 👇 ለ Admin እና Super Admin ማሳወቂያ መላክ
    const admins = await this.prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
      select: { id: true },
    });

    const facultyName = `${faculty.user.profile?.firstName || ''} ${faculty.user.profile?.lastName || ''}`.trim() || 'Faculty';
    const studentName = `${enrollment.student.user.profile?.firstName || ''} ${enrollment.student.user.profile?.lastName || ''}`.trim() || 'Student';

    for (const admin of admins) {
      await this.notifications.create(admin.id, {
        title: 'New Grade Change Request',
        message: `${facultyName} requested a grade change for ${studentName} in ${enrollment.section.course.code} from ${enrollment.grade || 'N/A'} to ${newGrade}.`,
        type: 'INFO',
        link: '/admin/grade-changes',
      });
    }

    return request;
  }

  async getPendingRequests() {
    return this.prisma.gradeChangeRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        enrollment: {
          include: {
            student: { include: { user: { include: { profile: true } } } },
            section: { include: { course: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewRequest(requestId: string, reviewerId: string, status: 'APPROVED' | 'REJECTED') {
    const request = await this.prisma.gradeChangeRequest.findUnique({ 
      where: { id: requestId },
      include: {
        enrollment: {
          include: {
            student: { include: { user: true } },
            section: { include: { course: true, instructor: { include: { user: true } } } },
          },
        },
      },
    });
    if (!request) throw new NotFoundException('Request not found');

    const updatedRequest = await this.prisma.gradeChangeRequest.update({
      where: { id: requestId },
      data: { status, reviewedBy: reviewerId, reviewedAt: new Date() },
    });

    if (status === 'APPROVED') {
      await this.prisma.enrollment.update({
        where: { id: request.enrollmentId },
        data: { grade: request.newGrade, status: request.newGrade === 'F' ? 'FAILED' : 'COMPLETED' },
      });
    }

    // 👇 ለተማሪው ማሳወቂያ መላክ
    await this.notifications.create(request.enrollment.student.userId, {
      title: status === 'APPROVED' ? 'Grade Updated' : 'Grade Change Rejected',
      message: status === 'APPROVED'
        ? `Your grade for ${request.enrollment.section.course.code} has been updated from ${request.oldGrade} to ${request.newGrade}.`
        : `Your grade change request for ${request.enrollment.section.course.code} was rejected.`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      link: '/student/grades',
    });

    // 👇 ለመምህሩ ማሳወቂያ መላክ
    if (request.enrollment.section.instructor) {
      await this.notifications.create(request.enrollment.section.instructor.userId, {
        title: status === 'APPROVED' ? 'Grade Change Approved' : 'Grade Change Rejected',
        message: `Your grade change request for ${request.enrollment.section.course.code} (${request.oldGrade} → ${request.newGrade}) has been ${status.toLowerCase()}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        link: '/faculty/gradebook',
      });
    }

    return updatedRequest;
  }
}