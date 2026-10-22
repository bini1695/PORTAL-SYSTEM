import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Term } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateSectionDto } from './dto/create-section.dto';
import type { UpdateSectionDto } from './dto/update-section.dto';

export interface ListSectionsQuery {
  term?: Term;
  academicYear?: string;
  courseId?: string;
  search?: string;
}

@Injectable()
export class SectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListSectionsQuery) {
    const where: Prisma.SectionWhereInput = {};
    if (query.term) where.term = query.term;
    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.courseId) where.courseId = query.courseId;
    
    if (query.search) {
      // MySQL does not support 'mode: insensitive', so we remove it.
      // utf8mb4_unicode_ci collation makes queries case-insensitive by default.
      where.OR = [
        { sectionCode: { contains: query.search } },
        { course: { code: { contains: query.search } } },
        { course: { title: { contains: query.search } } },
      ];
    }

    const sections = await this.prisma.section.findMany({
      where,
      include: {
        course: true,
        instructor: { include: { user: { include: { profile: true } } } },
      },
      orderBy: [{ term: 'asc' }, { academicYear: 'desc' }, { sectionCode: 'asc' }],
    });

    return sections.map((s) => ({
      id: s.id,
      sectionCode: s.sectionCode,
      term: s.term,
      academicYear: s.academicYear,
      room: s.room,
      capacity: s.capacity,
      enrolledCount: s.enrolledCount,
      waitlistCount: s.waitlistCount,
      schedule: s.schedule,
      course: {
        id: s.course.id,
        code: s.course.code,
        title: s.course.title,
        creditUnits: s.course.creditUnits,
      },
      instructorName: s.instructor
        ? `${s.instructor.user.profile?.firstName ?? ''} ${s.instructor.user.profile?.lastName ?? ''}`.trim()
        : null,
    }));
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        course: { include: { prerequisites: { include: { prerequisite: true } } } },
        instructor: { include: { user: { include: { profile: true } } } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async create(actorId: string, dto: CreateSectionDto) {
    await this.ensureCourse(dto.courseId);
    if (dto.instructorId) await this.ensureInstructor(dto.instructorId);

    this.validateSchedule(dto.schedule);

    const exists = await this.prisma.section.findUnique({
      where: {
        courseId_term_academicYear_sectionCode: {
          courseId: dto.courseId,
          term: dto.term,
          academicYear: dto.academicYear,
          sectionCode: dto.sectionCode,
        },
      },
    });
    if (exists) throw new ConflictException('Section already exists');

    const section = await this.prisma.section.create({
      data: {
        courseId: dto.courseId,
        instructorId: dto.instructorId,
        term: dto.term,
        academicYear: dto.academicYear,
        sectionCode: dto.sectionCode,
        room: dto.room,
        capacity: dto.capacity,
        schedule: dto.schedule as unknown as Prisma.InputJsonValue,
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'SECTION_CREATED',
      entity: 'Section',
      entityId: section.id,
    });
    return section;
  }

  async update(actorId: string, id: string, dto: UpdateSectionDto) {
    await this.ensureSection(id);
    if (dto.capacity !== undefined) {
      const current = await this.prisma.section.findUniqueOrThrow({
        where: { id },
        select: { enrolledCount: true },
      });
      if (dto.capacity < current.enrolledCount) {
        throw new BadRequestException(
          'Capacity cannot be less than current enrolled count',
        );
      }
    }
    if (dto.schedule) this.validateSchedule(dto.schedule);
    if (dto.instructorId) await this.ensureInstructor(dto.instructorId);

    const updated = await this.prisma.section.update({
      where: { id },
      data: {
        instructorId: dto.instructorId,
        room: dto.room,
        capacity: dto.capacity,
        schedule: dto.schedule
          ? (dto.schedule as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'SECTION_UPDATED',
      entity: 'Section',
      entityId: id,
    });
    return updated;
  }

  async roster(actorId: string, sectionId: string) {
    await this.ensureSection(sectionId);
    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, status: { in: ['ENROLLED', 'WAITLISTED'] } },
      include: {
        student: {
          include: { user: { include: { profile: true } } },
        },
      },
      orderBy: [{ status: 'asc' }, { enrolledAt: 'asc' }],
    });
    await this.audit.record({
      userId: actorId,
      action: 'ROSTER_VIEWED',
      entity: 'Section',
      entityId: sectionId,
    });
    return enrollments.map((e) => ({
      enrollmentId: e.id,
      status: e.status,
      enrolledAt: e.enrolledAt,
      studentId: e.student.id,
      studentNumber: e.student.studentNumber,
      name: `${e.student.user.profile?.firstName ?? ''} ${e.student.user.profile?.lastName ?? ''}`.trim(),
      email: e.student.user.email,
    }));
  }

  private async ensureSection(id: string): Promise<void> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!section) throw new NotFoundException('Section not found');
  }

  private async ensureCourse(id: string): Promise<void> {
    const c = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!c) throw new NotFoundException('Course not found');
  }

  private async ensureInstructor(id: string): Promise<void> {
    const f = await this.prisma.faculty.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!f) throw new NotFoundException('Instructor not found');
  }

  private validateSchedule(
    slots: { day: string; start: string; end: string }[],
  ): void {
    const toMin = (s: string): number => {
      const [h, m] = s.split(':').map(Number);
      return h * 60 + m;
    };
    for (const s of slots) {
      if (toMin(s.end) <= toMin(s.start)) {
        throw new BadRequestException(
          `Schedule end must be after start on ${s.day}`,
        );
      }
    }
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (
          a.day === b.day &&
          toMin(a.start) < toMin(b.end) &&
          toMin(b.start) < toMin(a.end)
        ) {
          throw new BadRequestException(
            `Self-overlapping schedule slots on ${a.day}`,
          );
        }
      }
    }
  }
}