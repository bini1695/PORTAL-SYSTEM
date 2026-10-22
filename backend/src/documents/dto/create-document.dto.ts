
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsUrl({ require_tld: false })
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}