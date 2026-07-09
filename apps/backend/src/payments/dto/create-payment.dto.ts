import { IsUUID, IsNumber, IsEnum, IsOptional, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  studentId!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount!: number;

  @IsDate()
  @Type(() => Date)
  month!: Date;

  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @IsString()
  @IsOptional()
  note?: string;
}
