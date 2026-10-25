import { Global, Module } from '@nestjs/common';
import { AuditController } from './audit.controller'; // 👈 ይህን ጨምር
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 ይህንም ጨምር

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuditController], // 👈 ይህን ጨምር
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}