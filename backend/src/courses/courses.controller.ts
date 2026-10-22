import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.courses.list(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courses.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.REGISTRAR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courses.create(user.sub, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.REGISTRAR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(user.sub, id, dto);
  }

  @Post(':id/prerequisites')
  @Roles(Role.ADMIN, Role.REGISTRAR)
  addPrereq(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreatePrerequisiteDto,
  ) {
    return this.courses.addPrerequisite(user.sub, id, dto);
  }

  @Delete(':id/prerequisites/:prerequisiteId')
  @Roles(Role.ADMIN, Role.REGISTRAR)
  removePrereq(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('prerequisiteId') prerequisiteId: string,
  ) {
    return this.courses.removePrerequisite(user.sub, id, prerequisiteId);
  }
}