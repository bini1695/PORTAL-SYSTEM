import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(search?: string) {
    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    return this.prisma.course.findMany({
      where,
      include: {
        prerequisites: { include: { prerequisite: true } },
        isPrerequisiteFor: { include: { course: true } },
        _count: { select: { sections: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        prerequisites: { include: { prerequisite: true } },
        isPrerequisiteFor: { include: { course: true } },
        sections: true,
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(actorId: string, dto: CreateCourseDto) {
    const exists = await this.prisma.course.findUnique({
      where: { code: dto.code.toUpperCase() },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Course code already exists');

    const course = await this.prisma.course.create({
      data: { ...dto, code: dto.code.toUpperCase() },
    });
    await this.audit.record({
      userId: actorId,
      action: 'COURSE_CREATED',
      entity: 'Course',
      entityId: course.id,
    });
    return course;
  }

  async update(actorId: string, id: string, dto: UpdateCourseDto) {
    await this.ensureCourse(id);
    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'COURSE_UPDATED',
      entity: 'Course',
      entityId: id,
    });
    return updated;
  }

  async addPrerequisite(
    actorId: string,
    courseId: string,
    dto: CreatePrerequisiteDto,
  ) {
    await this.ensureCourse(courseId);
    if (courseId === dto.prerequisiteId) {
      throw new ConflictException('Course cannot be its own prerequisite');
    }
    await this.ensureCourse(dto.prerequisiteId);

    const existing = await this.prisma.prerequisite.findUnique({
      where: {
        courseId_prerequisiteId: {
          courseId,
          prerequisiteId: dto.prerequisiteId,
        },
      },
    });
    if (existing) throw new ConflictException('Prerequisite already exists');

    const prereq = await this.prisma.prerequisite.create({
      data: {
        courseId,
        prerequisiteId: dto.prerequisiteId,
        minimumGrade: dto.minimumGrade ?? 'D',
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'PREREQUISITE_ADDED',
      entity: 'Prerequisite',
      entityId: prereq.id,
    });
    return prereq;
  }

  async removePrerequisite(
    actorId: string,
    courseId: string,
    prerequisiteId: string,
  ): Promise<{ success: true }> {
    const existing = await this.prisma.prerequisite.findUnique({
      where: { courseId_prerequisiteId: { courseId, prerequisiteId } },
    });
    if (!existing) throw new NotFoundException('Prerequisite link not found');
    await this.prisma.prerequisite.delete({
      where: { courseId_prerequisiteId: { courseId, prerequisiteId } },
    });
    await this.audit.record({
      userId: actorId,
      action: 'PREREQUISITE_REMOVED',
      entity: 'Prerequisite',
      entityId: existing.id,
    });
    return { success: true };
  }

  private async ensureCourse(id: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('Course not found');
  }
}