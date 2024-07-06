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
export class Experience extends AbstractEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  jobTitle: string;

  @Column()
  @ApiProperty()
  companyName: string;

  @Column({ type: 'date' })
  @ApiProperty()
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional()
  endDate: Date;

  @Column()
  @ApiProperty()
  description: string;

  @ManyToOne(() => Profile, (profile) => profile.experiences)
  profile: Profile;
}
