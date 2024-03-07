import { UserType } from '@app/shared/enums/userType.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';

export enum AllowedUserTypes {
  jobSeeker = UserType.jobSeeker,
  recruiter = UserType.recruiter,
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsEnum(AllowedUserTypes)
  userType: AllowedUserTypes;
}
