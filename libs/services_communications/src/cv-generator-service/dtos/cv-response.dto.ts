import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CVResponseDto {
  @ApiProperty({ description: "The CV PDF link", required: true })
  @IsNotEmpty()
  pdf: string;

  @ApiProperty({ description: "The CV Word link", required: true })
  word: string;
}
