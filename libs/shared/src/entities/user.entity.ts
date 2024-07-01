import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserType } from '../enums/user-type.enum';
import { AbstractEntity } from './abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Factory } from 'nestjs-seeder';
import { AllowedUserTypes } from '@app/services_communications';

@Entity()
export class User extends AbstractEntity {

  @ApiProperty({
    description: 'Id of the user',
    example: 'd2b9f3a6-3e9f-4e3d-9f3a-63e9f4e3d9f3',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'waer@waer.com',
  })
  @Column({ unique: true, type: 'varchar', nullable: false })
  @Factory(faker => faker.internet.email())
  email: string;

  @Factory(faker => "$2a$12$ssnHJiRax4kp.TgXbx8RNu2T9OC.hzSgwReoD1l5SPLIY7R66on7K")
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'firstName of the user',
    example: 'waer',
  })
  @Factory(faker => faker.person.firstName())
  @Column({})
  firstName: string;

  @ApiProperty({
    description: 'lastName of the user',
    example: 'alwaer',
  })
  @Column({})
  @Factory(faker => faker.person.lastName())
  lastName: string;

  @ApiProperty({
    description: 'phoneNumber of the user',
    example: '0599999999',
  })
  @Column({
    type: 'text',
  })
  @Factory(faker => faker.phone.number())
  phoneNumber: string;

  @ApiProperty({
    description: 'country of the user',
    example: 'Palestine',
  })
  @Column({
    type: 'text',
  })
  @Factory(faker => faker.location.country())
  country: string;

  @ApiProperty({
    description: 'city of the user',
    example: 'giza',
  })
  @Column({
    type: 'text',
  })
  @Factory(faker => faker.location.city())
  city: string;

  @ApiProperty({
    description: 'address of the user',
    example: 'giza tawabik',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  @Factory(faker => faker.location.streetAddress())
  address: string;

  @ApiProperty({
    description: 'dateOfBirth of the user',
    example: '1999-12-12',
  })
  @Column({
    type: 'date',
  })
  @Factory(faker => faker.date.past())
  dateOfBirth: Date;

  @ApiProperty({
    description: 'photo of the user',
    example: 'https://avatars.githubusercontent.com/u/70758177?v=4',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  @Factory(faker => faker.image.avatar())
  photo: string;

  @ApiProperty({
    description: 'type of the user',
    enum: UserType,
    example: UserType.jobSeeker,
  })
  @Column({ type: 'enum', enum: UserType, default: UserType.jobSeeker })
  @Factory(faker => faker.helpers.enumValue(AllowedUserTypes))
  type: UserType;

  @Column({
    type: 'boolean',
    default: false,
  })
  @Exclude()
  @Factory(faker => faker.helpers.arrayElement([true, true]))
  isVerified: boolean;

  @ApiProperty({
    description: 'createdAt of the user',
    example: '2021-12-12T00:00:00.000Z',
  })
  @Expose()
  get joinedAt(): string {
    try{
    return this.createdAt.toISOString() || new Date().toISOString();
    } catch (error) {
      console.log('error', error);
      return new Date().toISOString();
    }
  }
}
