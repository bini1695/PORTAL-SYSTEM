import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module'; // 👈 አስፈላጊ ነው

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [SettingsController],
})
export class SettingsModule {}