import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class changePasswordDto {
  @ApiProperty({
    description: 'the current password of the user',
    example: 'Password123+',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'the new password of the user',
    example: 'Password123+',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    description: 'the new password of the user',
    example: 'Password123+',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  confirmPassword: string;

  userId: string;
}
