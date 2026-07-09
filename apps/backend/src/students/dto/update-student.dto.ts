import { IsString, IsOptional, IsDate, IsNumber, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate?: Date;

  @IsUUID()
  @IsOptional()
  groupId?: string;

  @IsIn(['ACTIVE', 'INACTIVE', 'LEAVED'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;
}
