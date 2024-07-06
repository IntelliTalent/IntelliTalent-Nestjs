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
export class Education extends AbstractEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  degree: string;

  @Column()
  @ApiProperty()
  schoolName: string;

  @Column({ type: 'date' })
  @ApiProperty()
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional()
  endDate: Date;

  @Column({ type: 'text' })
  @ApiProperty()
  description: string;

  @ManyToOne('Profile', 'educations', { onDelete: 'CASCADE' })
  profile: Profile;
}
