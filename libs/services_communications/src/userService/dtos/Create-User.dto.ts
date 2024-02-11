import { UserType } from '@app/shared/enums/userType.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsEnum(UserType)
  userType: UserType;
}
