import { ApiProperty } from '@nestjs/swagger';

export class CVResponseDto {
  @ApiProperty({ description: "The CV Word link", required: true })
  word: string;
}
