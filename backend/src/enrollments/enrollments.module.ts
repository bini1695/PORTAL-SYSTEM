import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentsModule {}