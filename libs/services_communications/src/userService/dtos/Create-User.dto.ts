import { UserType } from '@app/shared/enums/userType.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AllowedUserTypes {
  jobSeeker = UserType.jobSeeker,
  recruiter = UserType.recruiter,
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ enum: AllowedUserTypes})
  @IsEnum(AllowedUserTypes)
  userType: AllowedUserTypes;
}
