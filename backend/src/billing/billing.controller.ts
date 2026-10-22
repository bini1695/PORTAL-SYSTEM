import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('invoices/me')
  @Roles(Role.STUDENT)
  myInvoices(@CurrentUser() user: AuthenticatedUser) {
    return this.billing.listMyInvoices(user.sub);
  }

  @Get('invoices')
  @Roles(Role.BURSAR, Role.ADMIN)
  listInvoices(
    @Query('studentId') studentId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.billing.listAll({ studentId, status });
  }

  @Post('invoices')
  @Roles(Role.BURSAR, Role.ADMIN)
  createInvoice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.billing.createInvoice(user.sub, dto);
  }

  @Post('invoices/:id/reconcile')
  @Roles(Role.BURSAR, Role.ADMIN)
  reconcile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.billing.reconcileInvoice(user.sub, id);
  }

  @Post('payments')
  @Roles(Role.BURSAR, Role.ADMIN, Role.STUDENT)
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.billing.recordPayment(user.sub, dto);
  }
}