import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { HoldType } from '@prisma/client';

export class CreateHoldDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(HoldType)
  type!: HoldType;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}