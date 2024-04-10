import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CoverLetterResponseDto {
  @ApiProperty({ description: "The cover letter Word link", required: true })
  word: string;

  @ApiProperty({ description: "The cover letter content text", required: true })
  text: string;
}
