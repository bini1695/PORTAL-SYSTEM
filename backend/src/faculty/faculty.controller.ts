import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { FacultyService } from './faculty.service';

@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly faculty: FacultyService) {}

  // 👇 አዲስ የተጨመረ - አድሚኑ አስተማሪዎችን ለመምረጥ የሚያገለግል
  @Get('list')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAllFaculty() {
    return this.faculty.getAllFaculty();
  }

  @Get('sections')
  @Roles(Role.FACULTY, Role.ADMIN)
  getMySections(@CurrentUser() user: AuthenticatedUser) {
    return this.faculty.getMySections(user.sub);
  }

  @Get('sections/:id/roster')
  @Roles(Role.FACULTY, Role.ADMIN)
  getRoster(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.faculty.getSectionRoster(user.sub, id);
  }

  @Post('grades')
  @Roles(Role.FACULTY, Role.ADMIN)
  submitGrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body('enrollmentId') enrollmentId: string,
    @Body('grade') grade: string,
  ) {
    return this.faculty.submitGrade(user.sub, enrollmentId, grade);
  }
}