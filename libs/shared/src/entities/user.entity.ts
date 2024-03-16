import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserType } from '../enums/userType.enum';
import { AbstractEntity } from './abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'firstName of the user',
    example: 'waer',
  })
  @Column({})
  firstName: string;

  @ApiProperty({
    description: 'lastName of the user',
    example: 'alwaer',
  })
  @Column({})
  lastName: string;

  @ApiProperty({
    description: 'phoneNumber of the user',
    example: '0599999999',
  })
  @Column({
    type: 'text',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'country of the user',
    example: 'Palestine',
  })
  @Column({
    type: 'text',
  })
  country: string;

  @ApiProperty({
    description: 'city of the user',
    example: 'giza',
  })
  @Column({
    type: 'text',
  })
  city: string;

  @ApiProperty({
    description: 'address of the user',
    example: 'giza tawabik',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  address: string;

  @ApiProperty({
    description: 'dateOfBirth of the user',
    example: '1999-12-12',
  })
  @Column({
    type: 'date',
  })
  dateOfBirth: Date;

  @ApiProperty({
    description: 'photo of the user',
    example: 'https://avatars.githubusercontent.com/u/70758177?v=4',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  photo: string;

  @ApiProperty({
    description: 'type of the user',
    enum: UserType,
    example: UserType.jobSeeker,
  })
  @Column({ type: 'enum', enum: UserType, default: UserType.jobSeeker })
  type: UserType;


  @Column({
    type: 'boolean',
    default: false,
  })
  @Exclude()
  isVerified: boolean;
}
