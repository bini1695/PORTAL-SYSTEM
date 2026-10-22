import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePrerequisiteDto {
  @IsUUID()
  prerequisiteId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  minimumGrade?: string;
}