import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from './abstract.entity';
import { Profile } from './profile.entity';

@Entity()
export class Certificate extends AbstractEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  authority: string;

  @Column({ type: 'date' })
  @ApiProperty()
  issuedAt: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional()
  validUntil: Date;

  @Column()
  @ApiProperty()
  url: string;

  @ManyToOne(() => Profile, (profile) => profile.certificates)
  profile: Profile;
}
