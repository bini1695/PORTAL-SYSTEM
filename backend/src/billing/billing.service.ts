import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service'; // 👈 አዲስ
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService, // 👈 አዲስ
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

  // 👇 አዲስ የተጨመረ - ተማሪው የራሱን ደረሰኞች ለማየት
  async getMyInvoices(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.invoice.findMany({
      where: { studentId: student.id },
      include: { payments: true },
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
      include: { student: { include: { user: true } } },
    });

    // 👇 ለተማሪው ማሳወቂያ መላክ
    await this.notifications.create(invoice.student.userId, {
      title: 'New Invoice Generated',
      message: `Invoice ${invoice.number} for $${(invoice.amountCents / 100).toFixed(2)} has been generated. Due: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      type: 'INFO',
      link: '/student/invoices',
    });

    await this.audit.record({ userId: actorId, action: 'INVOICE_CREATED', entity: 'Invoice', entityId: invoice.id });
    return invoice;
  }

  async recordPayment(actorId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
        include: { payments: true, student: { include: { user: true } } },
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

      // 👇 ለተማሪው ማሳወቂያ መላክ
      await this.notifications.create(invoice.student.userId, {
        title: 'Payment Received',
        message: `Payment of $${(dto.amountCents / 100).toFixed(2)} received for invoice ${invoice.number}. ${newStatus === 'PAID' ? 'Invoice fully paid!' : ''}`,
        type: 'SUCCESS',
        link: '/student/invoices',
      });

      await this.audit.record({ userId: actorId, action: 'PAYMENT_RECORDED', entity: 'Payment', entityId: payment.id, metadata: { amountCents: dto.amountCents, invoiceId: invoice.id } });
      return payment;
    });
  }

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