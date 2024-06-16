import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  userId: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  jobTitle: string;

  @ApiProperty({
    type: 'string',
    isArray: true,
    example: ['JavaScript', 'Node.js'],
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ example: 3 })
  @IsInt()
  yearsOfExperience: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  graduatedFromCS: boolean;

  @ApiProperty({ type: [String], example: ['English', 'Spanish'] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional({
    example: 'Experienced software engineer with expertise in web development.',
  })
  @IsString()
  summary: string;

  @IsOptional()
  @ApiProperty({ example: 'https://example.com/cv.pdf' })
  @IsString()
  cv: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'https://linkedin.com/your-profile' })
  @IsString()
  linkedIn?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'https://github.com/your-profile' })
  @IsString()
  gitHub?: string;

  @ApiProperty({
    type: () => [CreateExperienceDto],
    example: [
      {
        jobTitle: 'Senior Software Engineer',
        companyName: 'Example Company',
        startDate: '2022-01-01',
        endDate: '2023-12-31',
        description: 'Developed web applications using Angular and Node.js.',
      },
      {
        jobTitle: 'Software Engineer',
        companyName: 'Example Company',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        description: 'Developed web applications using React and Node.js.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  experiences: CreateExperienceDto[];

  @ApiProperty({
    type: () => [CreateEducationDto],
    example: [
      {
        degree: 'Bachelor of Science in Computer Science',
        schoolName: 'University of Example',
        startDate: '2018-09-01',
        endDate: '2022-06-30',
        description:
          'Studied various computer science topics including algorithms and databases.',
      },
      {
        degree: 'Master of Science in Software Engineering',
        schoolName: 'University of Example',
        startDate: '2022-09-01',
        endDate: '2024-06-30',
        description: 'Studied advanced software engineering topics.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  educations: CreateEducationDto[];

  @ApiProperty({
    type: () => [CreateProjectDto],
    example: [
      {
        name: 'Online Shopping Platform',
        description:
          'Developed an e-commerce platform using React and Node.js.',
        skills: ['React', 'Node.js'],
        size: 5,
      },
      {
        name: 'Social Media App',
        description:
          'Developed a social media application using Angular and NestJS.',
        skills: ['Angular', 'NestJS'],
        size: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectDto)
  projects: CreateProjectDto[];

  @ApiProperty({
    type: () => [CreateCertificateDto],
    example: [
      {
        title: 'Certificate in Web Development',
        authority: 'Example Authority',
        issuedAt: '2021-01-01',
        validUntil: '2021-12-31',
        url: 'https://example.com/certificate.pdf',
      },
      {
        title: 'Certificate in Software Engineering',
        authority: 'Example Authority',
        issuedAt: '2022-01-01',
        validUntil: '2022-12-31',
        url: 'https://example.com/certificate.pdf',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCertificateDto)
  certificates: CreateCertificateDto[];
}

export class CreateExperienceDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: 'Example Company' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: '2022-01-01' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ required: false, example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    example: 'Developed web applications using Angular and Node.js.',
  })
  @IsString()
  description: string;
}

export class CreateEducationDto {
  @ApiProperty({ example: 'Bachelor of Science in Computer Science' })
  @IsString()
  degree: string;

  @ApiProperty({ example: 'University of Example' })
  @IsString()
  schoolName: string;

  @ApiProperty({ example: '2018-09-01' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ required: false, example: '2022-06-30' })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    example:
      'Studied various computer science topics including algorithms and databases.',
  })
  @IsString()
  description: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Online Shopping Platform' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Developed an e-commerce platform using React and Node.js.',
  })
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', isArray: true, example: ['React', 'Node.js'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ example: 5 })
  @IsNumber()
  size: number;
}

export class CreateCertificateDto {
  @ApiProperty({ example: 'Certificate in Web Development' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Example Authority' })
  @IsString()
  authority: string;

  @ApiProperty({ example: '2021-01-01' })
  @IsDateString()
  issuedAt: Date;

  @IsOptional()
  @ApiProperty({ required: false, example: '2021-12-31' })
  @IsDateString()
  validUntil: Date;

  @ApiProperty({ example: 'https://example.com/certificate.pdf' })
  @IsString()
  url: string;
}
