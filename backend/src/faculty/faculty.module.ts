import { Module } from '@nestjs/common';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { GradebookController } from './gradebook.controller';
import { GradebookService } from './gradebook.service';
import { GradeChangeController } from './grade-change.controller';
import { GradeChangeService } from './grade-change.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module'; // 👈 አዲስ

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // 👈 እዚህ ጋር መካተት አለበት
  ],
  controllers: [
    FacultyController, 
    GradebookController, 
    GradeChangeController
  ],
  providers: [
    FacultyService, 
    GradebookService, 
    GradeChangeService
  ],
})
export class FacultyModule {}