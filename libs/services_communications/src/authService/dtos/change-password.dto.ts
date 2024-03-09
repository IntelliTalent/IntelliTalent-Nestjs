import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
/**
 * Data Transfer Object
 */
export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password', required: true })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'The new password to be reset', required: true })
  @IsString()
  @MinLength(8, { message: 'Password Must have at least 8 characters' })
  newPassword: string;
}
/**
 * Data Transfer Object
 */
export class ChangeForgottenPasswordDto {
  @ApiProperty({ description: 'The new password to be reset', required: true })
  @IsString()
  @MinLength(8, { message: 'Password Must have at least 8 characters' })
  password: string;
}
