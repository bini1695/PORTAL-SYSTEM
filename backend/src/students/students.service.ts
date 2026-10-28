import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AccountStatus, DocumentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
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
      await this.prisma.$transaction(async (tx) => {
        await tx.student.update({ 
          where: { id: studentId }, 
          data: { status } 
        });
        
        await tx.user.update({ 
          where: { id: student.userId }, 
          data: { accountStatus: status } 
        });
      });
    } catch (error) {
      console.error("Prisma Update Error:", error);
      throw new BadRequestException('Could not update student status in database.');
    }

    try {
      await this.notifications.create(student.userId, {
        title: status === 'ACTIVE' ? 'Account Approved' : 'Account Update',
        message: status === 'ACTIVE' 
          ? 'Your account has been approved. You can now login and register for courses.'
          : `Your account status has been changed to ${status}.`,
        type: status === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
        link: '/login',
      });
    } catch (notifError) {
      console.warn('Notification failed:', notifError);
    }

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

  // 👇 የተሻሻለው የውጤት ፈንክሽን - ከ StudentMark ውጤቱን ያሰላል
  async getMyGrades(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: { include: { profile: true } } }
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        section: {
          include: {
            course: true,
            assessments: true, // 👈 የውጤት ክፍፍሎችን አምጣ
            instructor: { include: { user: { include: { profile: true } } } }
          }
        },
        marks: true, // 👈 የተማሪውን ነጥቦች አምጣ
      },
      orderBy: { enrolledAt: 'desc' }
    });

    const gradePoints: Record<string, number> = {
      'A': 4.0, 'A-': 3.75, 'B+': 3.5, 'B': 3.0, 'B-': 2.75,
      'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0
    };

    let totalCredits = 0;
    let totalPoints = 0;

    const courses = enrollments.map(e => {
      const credit = e.section.course.creditUnits;
      let totalPercentage = 0;

      // 👇 ከ StudentMark ውጤቱን አስላ
      e.section.assessments.forEach(a => {
        const mark = e.marks.find(m => m.assessmentId === a.id);
        if (mark) {
          totalPercentage += (mark.score / a.totalMarks) * a.weight;
        }
      });

      // 👇 ውጤቱን ወስን (ከ enrollment.grade ወይም ከተሰላው በመቶኛ)
      let finalGrade = e.grade;
      if (!finalGrade && totalPercentage > 0) {
        if (totalPercentage >= 90) finalGrade = 'A';
        else if (totalPercentage >= 85) finalGrade = 'A-';
        else if (totalPercentage >= 80) finalGrade = 'B+';
        else if (totalPercentage >= 75) finalGrade = 'B';
        else if (totalPercentage >= 70) finalGrade = 'B-';
        else if (totalPercentage >= 65) finalGrade = 'C+';
        else if (totalPercentage >= 60) finalGrade = 'C';
        else if (totalPercentage >= 50) finalGrade = 'D';
        else finalGrade = 'F';
      }

      const point = finalGrade ? (gradePoints[finalGrade] || 0) : 0;
      
      if (finalGrade) {
        totalCredits += credit;
        totalPoints += (point * credit);
      }

      return {
        id: e.id,
        grade: finalGrade || 'N/A',
        status: e.status,
        term: e.section.term,
        academicYear: e.section.academicYear,
        course: {
          code: e.section.course.code,
          title: e.section.course.title,
          creditUnits: credit,
        },
        instructor: e.section.instructor ? 
          `${e.section.instructor.user.profile?.firstName} ${e.section.instructor.user.profile?.lastName}` : 'TBA'
      };
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    return {
      student: {
        name: `${student.user.profile?.firstName} ${student.user.profile?.lastName}`,
        studentNumber: student.studentNumber,
        program: student.program,
        degreeLevel: student.degreeLevel,
      },
      gpa,
      totalCredits,
      courses,
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