import { IsString, IsNotEmpty, IsInt, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  teacherId!: string;

  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  capacity?: number;

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}
