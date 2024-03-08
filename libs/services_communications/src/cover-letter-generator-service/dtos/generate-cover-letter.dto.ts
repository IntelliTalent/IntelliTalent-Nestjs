import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCoverLetterDto {
  @ApiProperty()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({ required: false })
  companyName?: string;
}
