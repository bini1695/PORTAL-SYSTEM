import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  studentId!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}