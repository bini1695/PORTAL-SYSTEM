import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Role, Term } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly sections: SectionsService) {}

  @Get()
  list(
    @Query('term') term?: Term,
    @Query('academicYear') academicYear?: string,
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
  ) {
    return this.sections.list({ term, academicYear, courseId, search });
  }

  @Post()
  @Roles(Role.ADMIN, Role.REGISTRAR)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSectionDto) {
    return this.sections.create(user.sub, dto);
  }
}