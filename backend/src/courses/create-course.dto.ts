import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DegreeLevel } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(16)
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