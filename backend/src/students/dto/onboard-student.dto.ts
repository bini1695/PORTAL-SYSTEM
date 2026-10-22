import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DegreeLevel } from '@prisma/client';

export class OnboardStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  program!: string;

  @IsEnum(DegreeLevel)
  degreeLevel!: DegreeLevel;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}