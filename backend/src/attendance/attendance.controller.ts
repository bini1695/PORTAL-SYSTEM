import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('section/:sectionId')
  @Roles(Role.FACULTY, Role.ADMIN, Role.SUPER_ADMIN)
  getAttendance(
    @Param('sectionId') sectionId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getSectionAttendance(sectionId, date);
  }

  @Post('mark')
  @Roles(Role.FACULTY, Role.ADMIN, Role.SUPER_ADMIN)
  markAttendance(
    @Body('enrollmentId') enrollmentId: string,
    @Body('date') date: string,
    @Body('status') status: string,
  ) {
    return this.attendanceService.markAttendance(enrollmentId, date, status);
  }
}