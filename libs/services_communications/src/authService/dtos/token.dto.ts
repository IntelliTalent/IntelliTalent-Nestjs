import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'The token for google',
    required: true,
  })
  token: string;
}
