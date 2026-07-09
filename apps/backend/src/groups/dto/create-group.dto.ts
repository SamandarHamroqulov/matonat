import { IsString, IsUUID, IsInt, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString()
  name!: string;

  @IsUUID()
  teacherId!: string;

  @IsUUID()
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
