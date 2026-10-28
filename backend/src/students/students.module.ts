import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module'; // 👈 አዲስ የተጨመረ

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    NotificationsModule, // 👈 እዚህ ጋር መካተት አለበት
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}