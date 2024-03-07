import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserType } from '../enums/userType.enum';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', nullable: false })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({})
  firstName: string;

  @Column({})
  lastName: string;

  @Column({
    type: 'text',
  })
  phoneNumber: string;

  @Column({
    type: 'text',
  })
  country: string;

  @Column({
    type: 'text',
  })
  city: string;

  @Column({
    type: 'text',
  })
  address: string;

  @Column({
    type: 'date',
  })
  dateOfBirth: Date;

  @Column({
    type: 'text',
  })
  photo: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.jobSeeker })
  type: UserType;
}
