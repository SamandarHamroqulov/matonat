import { IsBoolean, IsInt, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  duration?: number; // months

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
