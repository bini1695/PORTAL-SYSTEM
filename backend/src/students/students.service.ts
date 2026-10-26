import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AccountStatus, DocumentType, Role } from '@prisma/client';
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
    const student = await this.prisma.student.findUnique({ 
      where: { id: studentId },
      include: { user: true }
    });
    
    if (!student) throw new NotFoundException('Student not found');

    try {
      // 👇 የተሻሻለ የ Transaction አጻጻፍ (በ MySQL ላይ በተለይ ጥሩ ይሰራል)
      await this.prisma.$transaction(async (tx) => {
        // 1. Update Student
        await tx.student.update({ 
          where: { id: studentId }, 
          data: { status } 
        });
        
        // 2. Update User Account
        await tx.user.update({ 
          where: { id: student.userId }, 
          data: { accountStatus: status } 
        });
      });
    } catch (error) {
      console.error("Prisma Update Error:", error);
      throw new BadRequestException('Could not update student status in database.');
    }

    // Audit Log (በተለየ የሚመዘገብ)
    try {
      await this.audit.record({
        userId: actorId,
        action: `STUDENT_STATUS_${status}`,
        entity: 'Student',
        entityId: studentId,
      });
    } catch (auditError) {
      console.warn("Audit log failed, but status was updated.", auditError);
    }

    return { success: true, status };
  }

  async getMyProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { include: { profile: true } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async getMyGrades(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, studentNumber: true, program: true, degreeLevel: true }
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        studentId: student.id,
        OR: [
          { status: 'COMPLETED' },
          { grade: { not: null } }
        ]
      },
      include: {
        section: {
          include: {
            course: true,
            instructor: { include: { user: { include: { profile: true } } } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return {
      student,
      enrollments: enrollments.map(e => ({
        id: e.id,
        grade: e.grade,
        status: e.status,
        term: e.section.term,
        academicYear: e.section.academicYear,
        course: {
          code: e.section.course.code,
          title: e.section.course.title,
          creditUnits: e.section.course.creditUnits
        }
      }))
    };
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; address?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  async uploadDocument(userId: string, type: DocumentType, url: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.document.create({
      data: {
        studentId: student.id,
        type,
        url,
        status: 'PENDING',
      },
    });
  }
}