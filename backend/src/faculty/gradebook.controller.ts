import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('faculty/gradebook')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FACULTY, Role.ADMIN)
export class GradebookController {
  constructor(private readonly gradebookService: GradebookService) {}

  @Get(':sectionId')
  getGradebook(@Param('sectionId') sectionId: string) {
    return this.gradebookService.getSectionGradebook(sectionId);
  }

  @Post(':sectionId/assessments')
  createAssessment(
    @Param('sectionId') sectionId: string,
    @Body() body: any,
  ) {
    return this.gradebookService.createAssessment(sectionId, body);
  }

  @Post(':sectionId/marks')
  saveMarks(
    @Param('sectionId') sectionId: string,
    @Body('assessmentId') assessmentId: string,
    @Body('marks') marks: any[],
  ) {
    return this.gradebookService.saveMarks(sectionId, assessmentId, marks);
  }

  @Patch(':sectionId/submit')
  submitGrades(@Param('sectionId') sectionId: string) {
    return this.gradebookService.submitFinalGrades(sectionId);
  }
}