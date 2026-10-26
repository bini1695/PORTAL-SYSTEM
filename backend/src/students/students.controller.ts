import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Role, AccountStatus, DocumentType } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StudentsService } from './students.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get('me')
  // 👇 SUPER_ADMIN እና ADMIN ን ጨምረናል (ስህተት እንዳይሰጥ)
  @Roles(Role.STUDENT, Role.SUPER_ADMIN, Role.ADMIN) 
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    // SUPER_ADMIN ወይም ADMIN ከሆነ የተማሪ መረጃ ስለሌላቸው ባዶ እንመልስ
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
      return { message: 'Admin profile access - use admin dashboard' };
    }
    return this.students.getMyProfile(user.sub);
  }

  @Get('me/grades')
  @Roles(Role.STUDENT)
  getMyGrades(@CurrentUser() user: AuthenticatedUser) {
    return this.students.getMyGrades(user.sub);
  }

  @Patch('me')
  @Roles(Role.STUDENT)
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.students.updateProfile(user.sub, body);
  }

  @Post('me/documents')
  @Roles(Role.STUDENT)
  uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body('type') type: DocumentType,
    @Body('url') url: string,
  ) {
    return this.students.uploadDocument(user.sub, type, url);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.REGISTRAR, Role.BURSAR) 
  listAll() {
    return this.students.listAll();
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.REGISTRAR) 
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.students.updateStatus(user.sub, id, status);
  }
}