import { JobPlace, JobType } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CustomFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  graduatedFromCS?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;
}

class Interview {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  interviewQuestions: string[];
}

export class CreateJobDto {
  userId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  jobLocation: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ enum: JobPlace })
  @IsEnum(JobPlace)
  jobPlace: JobPlace;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  neededExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  csRequired?: boolean;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  jobEndDate?: Date;

  @ApiProperty({ type: CustomFilters, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomFilters)
  customFilters?: CustomFilters;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  quizEndDate?: Date;

  @ApiProperty({ type: Interview, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Interview)
  interview?: Interview;
}
