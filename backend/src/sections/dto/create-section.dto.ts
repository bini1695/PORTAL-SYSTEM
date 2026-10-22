import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Term } from '@prisma/client';
import { ScheduleSlotDto } from './schedule-slot.dto';

export class CreateSectionDto {
  @IsUUID()
  courseId!: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsEnum(Term)
  term!: Term;

  @Matches(/^\d{4}-\d{4}$/, {
    message: 'academicYear must be YYYY-YYYY',
  })
  academicYear!: string;

  @IsString()
  @MaxLength(8)
  sectionCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  room?: string;

  @IsInt()
  @Min(1)
  @Max(500)
  capacity!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedule!: ScheduleSlotDto[];
}