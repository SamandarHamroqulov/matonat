import { IsString, IsOptional, IsEmail, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  subject!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  salary?: number;
}
