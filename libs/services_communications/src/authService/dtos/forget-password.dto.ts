import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
/**
 * Data Transfer Object
 */
export class ForgetPasswordDto {
  @ApiProperty({
    description: 'The email of the user to reset the password',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
