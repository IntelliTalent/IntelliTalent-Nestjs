import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IsUUIDDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
