import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Term } from '@prisma/client';
import { ScheduleSlotDto } from './schedule-slot.dto'; // ✅ ትክክለኛው መንገድ

export class CreateSectionDto {
  @IsUUID()
  courseId!: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsEnum(Term)
  term!: Term;

  @IsString()
  academicYear!: string;

  @IsString()
  sectionCode!: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule!: ScheduleSlotDto[];
}