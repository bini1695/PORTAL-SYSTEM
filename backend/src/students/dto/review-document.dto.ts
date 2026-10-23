import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class ReviewDocumentDto {
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}