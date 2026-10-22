import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class OverrideEnrollmentDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  sectionId!: string;

  @IsEnum(EnrollmentStatus)
  status!: EnrollmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}