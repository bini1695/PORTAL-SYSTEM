import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listMyInvoices(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return this.prisma.invoice.findMany({
      where: { studentId: student.id },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll(filter?: { studentId?: string; status?: InvoiceStatus }) {
    return this.prisma.invoice.findMany({
      where: filter,
      include: {
        payments: true,
        student: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(actorId: string, dto: CreateInvoiceDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true, studentNumber: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const number = await this.generateInvoiceNumber(student.studentNumber);

    const invoice = await this.prisma.invoice.create({
      data: {
        studentId: dto.studentId,
        number,
        amountCents: dto.amountCents,
        dueDate: new Date(dto.dueDate),
        description: dto.description,
      },
    });
    await this.audit.record({
      userId: actorId,
      action: 'INVOICE_CREATED',
      entity: 'Invoice',
      entityId: invoice.id,
    });
    return invoice;
  }

  async recordPayment(actorId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
        include: { payments: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status === 'VOID') {
        throw new BadRequestException('Cannot pay a void invoice');
      }
      if (invoice.status === 'PAID') {
        throw new BadRequestException('Invoice already fully paid');
      }

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

      const succeededSum =
        invoice.payments
          .filter((p) => p.status === 'SUCCEEDED')
          .reduce((s, p) => s + p.amountCents, 0) + dto.amountCents;

      const newStatus =
        succeededSum >= invoice.amountCents
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      });

      await this.audit.recordInTx(tx, {
        userId: actorId,
        action: 'PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: payment.id,
        metadata: { invoiceId: invoice.id, amountCents: dto.amountCents },
      });

      return payment;
    });
  }

  /**
   * Recompute invoice status from all payments. Useful for reconcile jobs.
   */
  async reconcileInvoice(actorId: string, invoiceId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const paid = invoice.payments
        .filter((p) => p.status === 'SUCCEEDED')
        .reduce((s, p) => s + p.amountCents, 0);

      let status: InvoiceStatus = InvoiceStatus.ISSUED;
      if (paid >= invoice.amountCents) status = InvoiceStatus.PAID;
      else if (paid > 0) status = InvoiceStatus.PARTIALLY_PAID;
      else if (invoice.dueDate.getTime() < Date.now())
        status = InvoiceStatus.OVERDUE;

      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: { status },
      });
      await this.audit.recordInTx(tx, {
        userId: actorId,
        action: 'INVOICE_RECONCILED',
        entity: 'Invoice',
        entityId: invoice.id,
        metadata: { status, paid },
      });
      return updated;
    });
  }

  private async generateInvoiceNumber(
    studentNumber: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.invoice.count({
      where: { number: { startsWith: `INV-${year}-` } },
    });
    const seq = (count + 1).toString().padStart(5, '0');
    return `INV-${year}-${studentNumber.replace(/[^0-9]/g, '')}-${seq}`;
  }
}
