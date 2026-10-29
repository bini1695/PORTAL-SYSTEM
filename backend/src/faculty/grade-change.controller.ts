import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { GradeChangeService } from './grade-change.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('grade-changes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeChangeController {
  constructor(private readonly gradeChangeService: GradeChangeService) {}

  @Post()
  @Roles(Role.FACULTY)
  requestChange(
    @CurrentUser() user: AuthenticatedUser,
    @Body('enrollmentId') enrollmentId: string,
    @Body('newGrade') newGrade: string,
    @Body('reason') reason: string,
  ) {
    return this.gradeChangeService.requestChange(user.sub, enrollmentId, newGrade, reason);
  }

  @Get('pending')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
  getPending() {
    return this.gradeChangeService.getPendingRequests();
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return this.gradeChangeService.reviewRequest(id, user.sub, status);
  }
}