import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DegreeLevel } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(16)
  @Matches(/^[A-Z]{2,6}[0-9]{2,4}$/, {
    message: 'Course code must be like CS101 or MATH2100',
  })
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  creditUnits!: number;

  @IsEnum(DegreeLevel)
  degreeLevel!: DegreeLevel;
}