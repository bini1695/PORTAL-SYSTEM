import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { DocumentsModule } from './documents/documents.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { BillingModule } from './billing/billing.module';
import { HoldsModule } from './holds/holds.module';
import { AuditModule } from './audit/audit.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { FacultyModule } from './faculty/faculty.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module'; // 👈 አዲስ የተጨመረ

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1_000, limit: 20 },
      { name: 'long', ttl: 60_000, limit: 300 },
    ]),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    DocumentsModule,
    CoursesModule,
    SectionsModule,
    EnrollmentsModule,
    BillingModule,
    HoldsModule,
    AnnouncementsModule,
    FacultyModule,
    SettingsModule,
    NotificationsModule, // 👈 እዚህ ጋር ተካቷል
  ],
})
export class AppModule {}