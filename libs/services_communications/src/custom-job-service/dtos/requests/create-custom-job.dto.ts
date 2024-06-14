import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomJobDto {
  @ApiProperty({
    description: 'The prompt of the job.',
    example: 'I want to hire a software developer with experience 3-5 years and have these skills ReactJs and TypeScript.'
  })
  @IsNotEmpty()
  jobPrompt: string;
}
