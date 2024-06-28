import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class JobsPageOptionsDto {
  @ApiPropertyOptional({
    required: false,
    description: 'Job title to search for',
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Job location to search for',
  })
  @IsOptional()
  @IsString()
  jobLocation?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Publish date to search for',
  })
  @IsOptional()
  @IsString()
  publishDate?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Computer science required',
  })
  @IsOptional()
  @IsString()
  @IsIn(['Yes', 'No'])
  csRequired?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Job types to search for',
  })
  @IsOptional()
  @IsString({ each: true })
  jobType?: string | string[];

  @ApiPropertyOptional({
    required: false,
    description: 'Job places to search for',
  })
  @IsOptional()
  @IsString({ each: true })
  jobPlace?: string | string[];

  @ApiPropertyOptional({
    required: false,
    description: 'Job sources to search for',
  })
  @IsOptional()
  @IsString({ each: true })
  jobSource?: string | string[];

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 200,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly take?: number = 10;
}
