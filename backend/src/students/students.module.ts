import { Module } from '@nestjs/common';
import {
  DocumentsReviewController,
  StudentsController,
} from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController, DocumentsReviewController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}