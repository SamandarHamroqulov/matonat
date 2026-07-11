import { IsString, IsInt, IsOptional, IsDate, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  capacity?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
