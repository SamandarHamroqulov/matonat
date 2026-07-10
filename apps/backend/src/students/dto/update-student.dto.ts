import { IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  fullName?: string;

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

  @IsString()
  @IsOptional()
  groupId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
