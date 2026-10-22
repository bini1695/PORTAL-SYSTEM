import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface ScheduleSlot {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start: string;
  end: string;
}

export interface EnrollmentResult {
  enrollmentId: string;
  status: 'ENROLLED' | 'WAITLISTED';
  sectionId: string;
  enrolledCount: number;
  waitlistCount: number;
}

const PASSING_GRADES = new Set(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D']);

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async enrollStudentInSection(
    userId: string,
    sectionId: string,
  ): Promise<EnrollmentResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const student = await tx.student.findUnique({
          where: { userId },
          select: { id: true, status: true, degreeLevel: true },
        });
        if (!student) throw new NotFoundException('Student profile not found');
        if (student.status !== 'ACTIVE') {
          throw new ForbiddenException(
            `Student account is ${student.status}. Enrollment not permitted.`,
          );
        }

        const section = await tx.section.findUnique({
          where: { id: sectionId },
          include: {
            course: {
              include: { prerequisites: { include: { prerequisite: true } } },
            },
          },
        });
        if (!section) throw new NotFoundException('Section not found');

        if (section.course.degreeLevel !== student.degreeLevel) {
          throw new BadRequestException(
            'Course degree level does not match student program level',
          );
        }

        const blockingHold = await tx.hold.findFirst({
          where: { studentId: student.id, active: true },
          select: { id: true, type: true, reason: true },
        });
        if (blockingHold) {
          throw new ForbiddenException(
            `Enrollment blocked by ${blockingHold.type} hold: ${blockingHold.reason}`,
          );
        }

        const prereqIds = section.course.prerequisites.map(
          (p) => p.prerequisiteId,
        );
        if (prereqIds.length > 0) {
          const passed = await tx.enrollment.findMany({
            where: {
              studentId: student.id,
              status: 'COMPLETED',
              grade: { in: Array.from(PASSING_GRADES) },
              section: { courseId: { in: prereqIds } },
            },
            select: { section: { select: { courseId: true } } },
          });
          const passedCourseIds = new Set(
            passed.map((e) => e.section.courseId),
          );
          const missing = section.course.prerequisites.filter(
            (p) => !passedCourseIds.has(p.prerequisiteId),
          );
          if (missing.length > 0) {
            throw new BadRequestException(
              `Missing prerequisites: ${missing
                .map((p) => p.prerequisite.code)
                .join(', ')}`,
            );
          }
        }

        const currentEnrollments = await tx.enrollment.findMany({
          where: {
            studentId: student.id,
            status: { in: ['ENROLLED', 'WAITLISTED'] },
            section: {
              term: section.term,
              academicYear: section.academicYear,
            },
          },
          include: { section: { select: { id: true, schedule: true } } },
        });

        const targetSlots = this.normalizeSchedule(section.schedule);
        for (const existing of currentEnrollments) {
          if (existing.section.id === section.id) {
            throw new ConflictException(
              'Already enrolled or waitlisted in this section',
            );
          }
          const existingSlots = this.normalizeSchedule(
            existing.section.schedule,
          );
          const conflict = this.findConflict(targetSlots, existingSlots);
          if (conflict) {
            throw new ConflictException(
              `Schedule conflict on ${conflict.day} ${conflict.start}–${conflict.end}`,
            );
          }
        }

        if (section.enrolledCount < section.capacity) {
          const updated = await tx.section.updateMany({
            where: {
              id: section.id,
              enrolledCount: { lt: section.capacity },
            },
            data: { enrolledCount: { increment: 1 } },
          });
          if (updated.count === 0) {
            return this.joinWaitlist(tx, student.id, section.id);
          }

          const enrollment = await tx.enrollment.create({
            data: {
              studentId: student.id,
              sectionId: section.id,
              status: 'ENROLLED',
            },
          });

          const fresh = await tx.section.findUniqueOrThrow({
            where: { id: section.id },
            select: { enrolledCount: true, waitlistCount: true },
          });

          await this.audit.recordInTx(tx, {
            userId,
            action: 'STUDENT_ENROLLED',
            entity: 'Enrollment',
            entityId: enrollment.id,
            metadata: { sectionId: section.id, status: 'ENROLLED' },
          });

          return {
            enrollmentId: enrollment.id,
            status: 'ENROLLED' as const,
            sectionId: section.id,
            enrolledCount: fresh.enrolledCount,
            waitlistCount: fresh.waitlistCount,
          };
        }

        return this.joinWaitlist(tx, student.id, section.id, userId);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5_000,
        timeout: 15_000,
      },
    );
  }

  private async joinWaitlist(
    tx: Prisma.TransactionClient,
    studentId: string,
    sectionId: string,
    actorId?: string,
  ): Promise<EnrollmentResult> {
    const enrollment = await tx.enrollment.create({
      data: { studentId, sectionId, status: 'WAITLISTED' },
    });
    const fresh = await tx.section.update({
      where: { id: sectionId },
      data: { waitlistCount: { increment: 1 } },
      select: { enrolledCount: true, waitlistCount: true },
    });
    if (actorId) {
      await this.audit.recordInTx(tx, {
        userId: actorId,
        action: 'STUDENT_WAITLISTED',
        entity: 'Enrollment',
        entityId: enrollment.id,
        metadata: { sectionId },
      });
    }
    return {
      enrollmentId: enrollment.id,
      status: 'WAITLISTED',
      sectionId,
      enrolledCount: fresh.enrolledCount,
      waitlistCount: fresh.waitlistCount,
    };
  }

  async dropStudentFromSection(
    userId: string,
    sectionId: string,
  ): Promise<{ success: true }> {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!student) throw new NotFoundException('Student profile not found');

      const enrollment = await tx.enrollment.findFirst({
        where: {
          studentId: student.id,
          sectionId,
          status: { in: ['ENROLLED', 'WAITLISTED'] },
        },
      });
      if (!enrollment) {
        throw new NotFoundException('No active enrollment for this section');
      }

      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'DROPPED', droppedAt: new Date() },
      });

      if (enrollment.status === 'ENROLLED') {
        await tx.section.update({
          where: { id: sectionId },
          data: { enrolledCount: { decrement: 1 } },
        });

        const next = await tx.enrollment.findFirst({
          where: { sectionId, status: 'WAITLISTED' },
          orderBy: { enrolledAt: 'asc' },
        });
        if (next) {
          await tx.enrollment.update({
            where: { id: next.id },
            data: { status: 'ENROLLED' },
          });
          await tx.section.update({
            where: { id: sectionId },
            data: {
              enrolledCount: { increment: 1 },
              waitlistCount: { decrement: 1 },
            },
          });
        }
      } else {
        await tx.section.update({
          where: { id: sectionId },
          data: { waitlistCount: { decrement: 1 } },
        });
      }

      await this.audit.recordInTx(tx, {
        userId,
        action: 'STUDENT_DROPPED',
        entity: 'Enrollment',
        entityId: enrollment.id,
        metadata: { sectionId },
      });

      return { success: true as const };
    });
  }

  async listMyEnrollments(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        section: {
          include: {
            course: true,
            instructor: { include: { user: { include: { profile: true } } } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => ({
      id: e.id,
      sectionId: e.sectionId,
      status: e.status,
      grade: e.grade,
      section: {
        id: e.section.id,
        sectionCode: e.section.sectionCode,
        term: e.section.term,
        academicYear: e.section.academicYear,
        room: e.section.room,
        schedule: e.section.schedule,
        course: {
          id: e.section.course.id,
          code: e.section.course.code,
          title: e.section.course.title,
          creditUnits: e.section.course.creditUnits,
        },
      },
    }));
  }

  async overrideEnrollment(
    actorId: string,
    actorRole: Role,
    studentId: string,
    sectionId: string,
    status: 'ENROLLED' | 'WAITLISTED' | 'DROPPED',
    reason?: string,
  ) {
    if (actorRole !== Role.ADMIN && actorRole !== Role.REGISTRAR) {
      throw new ForbiddenException('Only admins/registrars may override');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const section = await tx.section.findUnique({
          where: { id: sectionId },
          select: {
            id: true,
            capacity: true,
            enrolledCount: true,
            waitlistCount: true,
          },
        });
        if (!section) throw new NotFoundException('Section not found');

        const existing = await tx.enrollment.findFirst({
          where: { studentId, sectionId },
        });

        if (existing) {
          if (existing.status === 'ENROLLED' && status !== 'ENROLLED') {
            await tx.section.update({
              where: { id: sectionId },
              data: { enrolledCount: { decrement: 1 } },
            });
          }
          if (existing.status === 'WAITLISTED' && status !== 'WAITLISTED') {
            await tx.section.update({
              where: { id: sectionId },
              data: { waitlistCount: { decrement: 1 } },
            });
          }
          if (status === 'ENROLLED' && existing.status !== 'ENROLLED') {
            await tx.section.update({
              where: { id: sectionId },
              data: { enrolledCount: { increment: 1 } },
            });
          }
          if (status === 'WAITLISTED' && existing.status !== 'WAITLISTED') {
            await tx.section.update({
              where: { id: sectionId },
              data: { waitlistCount: { increment: 1 } },
            });
          }
          const updated = await tx.enrollment.update({
            where: { id: existing.id },
            data: { status, droppedAt: status === 'DROPPED' ? new Date() : null },
          });
          await this.audit.recordInTx(tx, {
            userId: actorId,
            action: 'ENROLLMENT_OVERRIDE',
            entity: 'Enrollment',
            entityId: updated.id,
            metadata: { sectionId, status, reason: reason ?? null },
          });
          return updated;
        }

        if (status === 'DROPPED') {
          throw new BadRequestException('No active enrollment to drop');
        }
        const created = await tx.enrollment.create({
          data: { studentId, sectionId, status },
        });
        await tx.section.update({
          where: { id: sectionId },
          data:
            status === 'ENROLLED'
              ? { enrolledCount: { increment: 1 } }
              : { waitlistCount: { increment: 1 } },
        });
        await this.audit.recordInTx(tx, {
          userId: actorId,
          action: 'ENROLLMENT_OVERRIDE',
          entity: 'Enrollment',
          entityId: created.id,
          metadata: { sectionId, status, reason: reason ?? null },
        });
        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async listAll() {
    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        student: { include: { user: { include: { profile: true } } } },
        section: { include: { course: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    return enrollments;
  }

  // FIXED: Updated parsing logic so TypeScript strict mode is happy
  private normalizeSchedule(json: Prisma.JsonValue): ScheduleSlot[] {
    if (!Array.isArray(json)) return [];
    return json.map((item) => {
      const slot = item as Record<string, unknown>;
      return {
        day: slot.day as ScheduleSlot['day'],
        start: slot.start as string,
        end: slot.end as string,
      };
    });
  }

  private findConflict(
    a: ScheduleSlot[],
    b: ScheduleSlot[],
  ): ScheduleSlot | null {
    for (const s1 of a) {
      for (const s2 of b) {
        if (s1.day !== s2.day) continue;
        if (
          this.toMinutes(s1.start) < this.toMinutes(s2.end) &&
          this.toMinutes(s2.start) < this.toMinutes(s1.end)
        ) {
          return s1;
        }
      }
    }
    return null;
  }

  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
}