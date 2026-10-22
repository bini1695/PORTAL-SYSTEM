import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  transactionId?: string;
}