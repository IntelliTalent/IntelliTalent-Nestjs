import { UserType } from '@app/shared/enums/user-type.enum';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AllowedUserTypes {
  jobSeeker = UserType.jobSeeker,
  recruiter = UserType.recruiter,
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'waer@waer.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Password123+',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'waer',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'alwaer',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '01557752400',
  })
  @IsPhoneNumber('EG')
  phoneNumber: string;

  @ApiProperty({
    description: 'Country of the user',
    example: 'Egypt',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'City of the user',
    example: 'Cairo',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Address of the user',
    example: 'giza tawabik',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Date of birth of the user',
    example: '1999-12-12',
  })
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Photo URL of the user',
    example: 'https://avatars.githubusercontent.com/u/70758177?v=4',
  })
  @IsString()
  photo: string;

  @ApiProperty({
    description: 'Type of the user',
    enum: AllowedUserTypes,
    example: AllowedUserTypes.jobSeeker,
  })
  @IsEnum(AllowedUserTypes)
  userType: AllowedUserTypes;
}
