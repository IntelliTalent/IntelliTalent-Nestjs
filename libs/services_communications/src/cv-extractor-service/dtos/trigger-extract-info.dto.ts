import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TriggerExtractInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cvLink: string;
}
