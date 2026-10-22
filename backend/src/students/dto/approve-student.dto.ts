import { IsEnum } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class ApproveStudentDto {
  @IsEnum(AccountStatus)
  status!: AccountStatus;
}