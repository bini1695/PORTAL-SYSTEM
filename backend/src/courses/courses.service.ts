import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateCourseDto } from './dto/create-course.dto';

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
            { code: { contains: search } },
            { title: { contains: search } },
          ],
        }
      : {};
    return this.prisma.course.findMany({
      where,
      orderBy: { code: 'asc' },
    });
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
}