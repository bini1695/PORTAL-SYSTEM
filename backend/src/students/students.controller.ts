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

  // ✅ የመገለጫ ማምጫ (ለተማሪ)
  @Get('me')
  @Roles(Role.STUDENT)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.students.getMyProfile(user.sub);
  }

  // ✅ የመገለጫ ማሻሻያ (ለተማሪ)
  @Patch('me')
  @Roles(Role.STUDENT)
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.students.updateProfile(user.sub, body);
  }

  // ✅ ሰነድ መጫን (ለተማሪ)
  @Post('me/documents')
  @Roles(Role.STUDENT)
  uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body('type') type: DocumentType,
    @Body('url') url: string,
  ) {
    return this.students.uploadDocument(user.sub, type, url);
  }

  // ✅ የተማሪዎች ዝርዝር (ለ Admin, Registrar, Bursar)
  @Get()
  @Roles(Role.ADMIN, Role.REGISTRAR, Role.BURSAR)
  listAll() {
    return this.students.listAll();
  }

  // ✅ የተማሪ ስታተስ መቀየር (ለ Admin, Registrar)
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.REGISTRAR)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.students.updateStatus(user.sub, id, status);
  }
}