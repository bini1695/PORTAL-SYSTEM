import { Body, Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcements.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.REGISTRAR, Role.FACULTY)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.announcements.create(user.sub, title, content);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.announcements.remove(id);
  }
}