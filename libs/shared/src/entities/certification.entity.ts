
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    Index,
  } from 'typeorm';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { AbstractEntity } from './abstract.entity';
  import { Experience } from './experiance.entity';
  import { Education } from './education.enity';
  import { Project } from './project.entity';
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
