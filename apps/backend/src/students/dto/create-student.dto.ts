import { IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  fullName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  parentPhone!: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  groupId?: string;
}
