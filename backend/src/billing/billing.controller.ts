import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
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

  @Get('stats')
  @Roles(Role.BURSAR, Role.ADMIN)
  getDashboardStats() {
    return this.billing.getDashboardStats();
  }

  @Get('invoices')
  @Roles(Role.BURSAR, Role.ADMIN)
  getAllInvoices() {
    return this.billing.getAllInvoices();
  }

  @Post('invoices')
  @Roles(Role.BURSAR, Role.ADMIN)
  createInvoice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.billing.createInvoice(user.sub, dto);
  }

  @Post('payments')
  @Roles(Role.BURSAR, Role.ADMIN)
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.billing.recordPayment(user.sub, dto);
  }

  // ✅ የተከፈሉ ክፍያዎችን ለማምጣት
  @Get('payments')
  @Roles(Role.BURSAR, Role.ADMIN)
  getAllPayments() {
    return this.billing.getAllPayments();
  }
}