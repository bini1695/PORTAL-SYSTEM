import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { EnrollmentService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { OverrideEnrollmentDto } from './dto/override.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentService) {}

  @Post()
  @Roles(Role.STUDENT)
  enroll(@CurrentUser() user: AuthenticatedUser, @Body() dto: EnrollDto) {
    return this.enrollments.enrollStudentInSection(user.sub, dto.sectionId);
  }

  @Delete(':sectionId')
  @Roles(Role.STUDENT)
  drop(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollments.dropStudentFromSection(user.sub, sectionId);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  myEnrollments(@CurrentUser() user: AuthenticatedUser) {
    return this.enrollments.listMyEnrollments(user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.REGISTRAR)
  listAll() {
    return this.enrollments.listAll();
  }

  @Post('override')
  @Roles(Role.ADMIN, Role.REGISTRAR)
  override(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OverrideEnrollmentDto,
  ) {
    return this.enrollments.overrideEnrollment(
      user.sub,
      user.role,
      dto.studentId,
      dto.sectionId,
      dto.status as 'ENROLLED' | 'WAITLISTED' | 'DROPPED',
      dto.reason,
    );
  }
}