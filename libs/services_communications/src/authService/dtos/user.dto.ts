import { ApiProperty } from '@nestjs/swagger';

export class ReturnedUserDto {
  @ApiProperty({ description: 'username of a user' })
  username: string;

  @ApiProperty({ description: 'email of a user' })
  email: string;
}
