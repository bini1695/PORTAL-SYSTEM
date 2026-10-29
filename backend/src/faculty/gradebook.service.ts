import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradebookService {
  constructor(private prisma: PrismaService) {}

  // 1. የውጤት ክፍፍል መፍጠር
  async createAssessment(sectionId: string, data: { name: string, type: any, weight: number, totalMarks: number }) {
    const existing = await this.prisma.assessment.findMany({ where: { sectionId } });
    const totalWeight = existing.reduce((sum, a) => sum + a.weight, 0) + data.weight;
    
    if (totalWeight > 100) throw new BadRequestException('Total weight cannot exceed 100%');

    return this.prisma.assessment.create({
      data: { sectionId, ...data },
    });
  }

  // 2. የውጤት ክፍፍልን መሰረዝ
  async deleteAssessment(sectionId: string, assessmentId: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, sectionId },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    await this.prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return { success: true, message: 'Assessment deleted successfully' };
  }

  // 3. የውጤት ማስሊያ
  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  // 4. ውጤት ማስገባት
  async saveMarks(sectionId: string, assessmentId: string, marks: { enrollmentId: string, score: number }[]) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException('Section not found');

    const enrollments = await this.prisma.enrollment.findMany({ where: { sectionId } });
    for (const en of enrollments) {
      if (en.gradeSubmitted) throw new BadRequestException('Grades are already locked/submitted.');
    }

    const queries = marks.map(m => 
      this.prisma.studentMark.upsert({
        where: { assessmentId_enrollmentId: { assessmentId, enrollmentId: m.enrollmentId } },
        update: { score: m.score },
        create: { assessmentId, enrollmentId: m.enrollmentId, score: m.score },
      })
    );
    await this.prisma.$transaction(queries);
    return { success: true };
  }

  // 5. የሴክሽን ሙሉ ውጤት ማምጣት
  async getSectionGradebook(sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        assessments: { orderBy: { createdAt: 'asc' } },
        enrollments: {
          include: {
            student: { include: { user: { include: { profile: true } } } },
            marks: true,
          },
        },
      },
    });

    if (!section) throw new NotFoundException('Section not found');

    const students = section.enrollments.map(en => {
      let totalPercentage = 0;
      const studentMarks: Record<string, number | null> = {};

      section.assessments.forEach(a => {
        const mark = en.marks.find(m => m.assessmentId === a.id);
        if (mark) {
          const percent = (mark.score / a.totalMarks) * a.weight;
          totalPercentage += percent;
          studentMarks[a.id] = mark.score;
        } else {
          studentMarks[a.id] = null;
        }
      });

      const calculatedGrade = this.calculateLetterGrade(totalPercentage);
      const finalGrade = en.grade || (totalPercentage > 0 ? calculatedGrade : null);

      return {
        enrollmentId: en.id,
        studentName: `${en.student.user.profile?.firstName || ''} ${en.student.user.profile?.lastName || ''}`.trim() || 'Unknown Student',
        studentNumber: en.student.studentNumber,
        email: en.student.user.email,
        marks: studentMarks,
        totalPercentage: Math.round(totalPercentage * 100) / 100,
        grade: finalGrade,
        gradeSubmitted: en.gradeSubmitted,
      };
    });

    return {
      sectionId: section.id,
      course: section.course,
      assessments: section.assessments,
      students,
    };
  }

  // 6. ውጤት ማጽደቅ እና መቆለፍ
  async submitFinalGrades(sectionId: string) {
    const gradebook = await this.getSectionGradebook(sectionId);
    
    const updates = gradebook.students.map(s => {
      if (!s.grade && s.totalPercentage > 0) {
        return this.prisma.enrollment.update({
          where: { id: s.enrollmentId },
          data: { grade: s.grade, status: 'COMPLETED', gradeSubmitted: true },
        });
      } else if (s.grade) {
        return this.prisma.enrollment.update({
          where: { id: s.enrollmentId },
          data: { gradeSubmitted: true },
        });
      }
      return null;
    }).filter(Boolean);

    await this.prisma.$transaction(updates as any[]);
    return { success: true, message: 'Grades submitted and locked successfully.' };
  }
}