import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role, AccountStatus } from '@prisma/client';
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

  // ... (የነበሩት ኮዶች)

  @Get()
  @Roles(Role.ADMIN, Role.REGISTRAR)
  listAll() {
    return this.students.listAll();
  }

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