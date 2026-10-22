import {
  Body,
  Controller,
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
import { HoldsService } from './holds.service';
import { CreateHoldDto } from './dto/create-hold.dto';

@Controller('holds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HoldsController {
  constructor(private readonly holds: HoldsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.REGISTRAR, Role.BURSAR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHoldDto,
  ) {
    return this.holds.create(user.sub, dto);
  }

  @Patch(':id/resolve')
  @Roles(Role.ADMIN, Role.REGISTRAR, Role.BURSAR)
  resolve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.holds.resolve(user.sub, id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.REGISTRAR, Role.BURSAR)
  list(
    @Query('studentId') studentId?: string,
    @Query('active') active?: string,
  ) {
    const filter: { studentId?: string; active?: boolean } = {};
    if (studentId) filter.studentId = studentId;
    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;
    return this.holds.list(filter);
  }
}