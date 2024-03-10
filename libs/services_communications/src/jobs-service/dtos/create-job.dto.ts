import { JobPlace, JobType, StageType } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interviewQuestions?: string[];
}

export class CreateJobDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  company: string;

  @ApiProperty()
  @IsNotEmpty()
  jobLocation: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  skills: string[];

  @ApiProperty()
  @IsNotEmpty()
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
  customFilters?: CustomFilters;

  @ApiProperty({
    enum: StageType,
    isArray: true,
    required: false,
    example: '0: INTERVIEW, 1: QUIZ',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(StageType, { each: true })
  stagesOrder?: StageType[];

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  quizEndDate?: Date;

  @ApiProperty({ type: Interview, required: false })
  @IsOptional()
  interview?: Interview;
}
