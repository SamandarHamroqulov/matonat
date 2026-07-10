import { IsString, IsEnum, IsOptional, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceEntryDto {
  @IsString()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class MarkAttendanceDto {
  @IsString()
  groupId!: string;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  entries!: AttendanceEntryDto[];
}
