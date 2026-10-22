import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { FacultyService } from './faculty.service';
import { SubmitGradeDto } from './dto/submit-grade.dto';

@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly faculty: FacultyService) {}

  @Get('me')
  @Roles(Role.FACULTY)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.faculty.getMyProfile(user.sub);
  }

  @Get('me/sections')
  @Roles(Role.FACULTY)
  mySections(@CurrentUser() user: AuthenticatedUser) {
    return this.faculty.mySections(user.sub);
  }

  @Post('grades')
  @Roles(Role.FACULTY)
  submitGrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitGradeDto,
  ) {
    return this.faculty.submitGrade(user.sub, dto.enrollmentId, dto.grade);
  }
}