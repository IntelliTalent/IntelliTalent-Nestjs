import { UserType } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({
    description: 'user id',
  })
  id: string;

  @ApiProperty({
    description: 'user email',
  })
  email: string;

  @ApiProperty({
    description: 'user first name',
  })
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  photo: string;

  @ApiProperty({
    type: UserType,
    enum: UserType,
  })
  type: UserType;
}
