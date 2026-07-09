import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  salary?: number;

  @IsOptional()
  isActive?: boolean;
}
