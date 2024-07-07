import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    Index,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { AbstractEntity } from './abstract.entity';
import { Profile } from './profile.entity';


@Entity()
export class Project extends AbstractEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  description: string;

  @Column({ type: 'varchar', array: true, default: [] })
  @ApiProperty({ type: [String], example: ['JavaScript', 'Node.js'] })
  skills: string[];

  @ManyToOne(() => Profile, (profile) => profile.projects)
  profile: Profile;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  size: number;

  @Column({ type:'varchar', nullable: true })
  @ApiProperty()
  url: string;
}

