import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { FacultyService } from './faculty.service';
import { GradebookService } from './gradebook.service';

@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(
    private readonly faculty: FacultyService,
    private readonly gradebook: GradebookService,
  ) {}

  @Get('overview')
  @Roles(Role.FACULTY, Role.ADMIN) 
  getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.faculty.getOverview(user.sub);
  }

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

  @Patch('grades')
  @Roles(Role.FACULTY, Role.ADMIN)
  submitGrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body('enrollmentId') enrollmentId: string,
    @Body('grade') grade: string,
  ) {
    return this.faculty.submitGrade(user.sub, enrollmentId, grade);
  }

  // ==========================================
  // Gradebook Endpoints
  // ==========================================
  
  @Get('gradebook/:sectionId')
  @Roles(Role.FACULTY, Role.ADMIN)
  getSectionGradebook(@Param('sectionId') sectionId: string) {
    return this.gradebook.getSectionGradebook(sectionId);
  }

  @Post('gradebook/:sectionId/assessments')
  @Roles(Role.FACULTY, Role.ADMIN)
  createAssessment(
    @Param('sectionId') sectionId: string,
    @Body() body: any,
  ) {
    return this.gradebook.createAssessment(sectionId, body);
  }

  // 👇 አዲስ የተጨመረ - የውጤት ክፍፍልን መሰረዝ
  @Delete('gradebook/:sectionId/assessments/:assessmentId')
  @Roles(Role.FACULTY, Role.ADMIN)
  deleteAssessment(
    @Param('sectionId') sectionId: string,
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.gradebook.deleteAssessment(sectionId, assessmentId);
  }

  @Post('gradebook/:sectionId/marks')
  @Roles(Role.FACULTY, Role.ADMIN)
  saveMarks(
    @Param('sectionId') sectionId: string,
    @Body('assessmentId') assessmentId: string,
    @Body('marks') marks: any[],
  ) {
    return this.gradebook.saveMarks(sectionId, assessmentId, marks);
  }

  @Patch('gradebook/:sectionId/submit')
  @Roles(Role.FACULTY, Role.ADMIN)
  submitFinalGrades(@Param('sectionId') sectionId: string) {
    return this.gradebook.submitFinalGrades(sectionId);
  }
}