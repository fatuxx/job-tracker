import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  company!: string;

  @IsString()
  role!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsDateString()
  appliedAt!: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}