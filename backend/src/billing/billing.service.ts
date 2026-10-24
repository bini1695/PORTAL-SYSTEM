import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getDashboardStats() {
    const invoices = await this.prisma.invoice.findMany();
    const totalCollected = invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((sum, i) => sum + i.amountCents, 0);
    const outstanding = invoices.filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.VOID).reduce((sum, i) => sum + i.amountCents, 0);
    const overdueCount = invoices.filter((i) => i.status === InvoiceStatus.OVERDUE).length;
    return { totalCollected, outstanding, overdueCount, totalInvoices: invoices.length };
  }

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      include: { student: { include: { user: { include: { profile: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(actorId: string, dto: CreateInvoiceDto) {
    const count = await this.prisma.invoice.count();
    const number = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    const invoice = await this.prisma.invoice.create({
      data: {
        studentId: dto.studentId,
        number,
        amountCents: dto.amountCents,
        dueDate: new Date(dto.dueDate),
        description: dto.description,
        status: InvoiceStatus.ISSUED,
      },
    });
    await this.audit.record({ userId: actorId, action: 'INVOICE_CREATED', entity: 'Invoice', entityId: invoice.id });
    return invoice;
  }

  async recordPayment(actorId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
        include: { payments: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status === InvoiceStatus.PAID) throw new BadRequestException('Invoice already paid');

      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amountCents: dto.amountCents,
          status: 'SUCCEEDED',
          method: dto.method,
          transactionId: dto.transactionId,
          paidAt: new Date(),
        },
      });

      const totalPaid = invoice.payments.filter((p) => p.status === 'SUCCEEDED').reduce((sum, p) => sum + p.amountCents, 0) + dto.amountCents;
      const newStatus = totalPaid >= invoice.amountCents ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

      await tx.invoice.update({ where: { id: invoice.id }, data: { status: newStatus } });
      await this.audit.record({ userId: actorId, action: 'PAYMENT_RECORDED', entity: 'Payment', entityId: payment.id, metadata: { amountCents: dto.amountCents, invoiceId: invoice.id } });
      return payment;
    });
  }

  // ✅ የተከፈሉ ክፍያዎችን ማምጣት (ከ recordPayment ውጪ መሆን አለበት)
  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            student: {
              include: {
                user: { include: { profile: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}