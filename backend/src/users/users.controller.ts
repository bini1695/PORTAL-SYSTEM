import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getMe(user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  list() {
    return this.users.findAll();
  }

  // 👇 አዲስ ተጠቃሚ ለመፍጠር (የጎደለው ክፍል)
  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.users.createUser(user.sub, body);
  }

  // 👇 የይለፍ ቃል ለመቀየር
  @Patch(':id/reset-password')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  resetPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.users.resetPassword(user.sub, id, password);
  }

  // 👇 የተጠቃሚ ስታተስ ለመቀየር (Active/Suspend)
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return this.users.updateStatus(user.sub, id, status);
  }

  // 👇 ተጠቃሚ ለማጥፋት
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.users.deleteUser(user.sub, id);
  }
}