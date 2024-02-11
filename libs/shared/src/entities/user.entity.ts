import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserType } from '../enums/userType.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', nullable: false })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserType, default: 'jobSeeker' })
  type: UserType;
}
