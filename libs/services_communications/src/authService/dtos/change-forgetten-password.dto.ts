import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MinLength } from 'class-validator';

/**
 * Data Transfer Object
 */
export class ChangeForgottenPasswordDto {
  @ApiProperty({ description: 'The new password to be reset', required: true })
  @IsString()
  @MinLength(8, { message: 'Password Must have at least 8 characters' })
  @IsStrongPassword()
  password: string;
}
