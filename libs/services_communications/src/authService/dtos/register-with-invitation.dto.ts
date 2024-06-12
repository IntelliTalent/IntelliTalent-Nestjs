// register-with-invitation.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWithInvitationDto {
  @ApiProperty({ description: 'The password.' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
