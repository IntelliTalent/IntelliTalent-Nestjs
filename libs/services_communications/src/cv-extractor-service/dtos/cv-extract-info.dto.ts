import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CvExtractInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  cv: string;
}
