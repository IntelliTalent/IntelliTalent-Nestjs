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
import { Certificate, Project, Education, Experience} from '@app/shared';

@Entity()
export class Profile extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty()
  @Index()
  userId: string;

  @Column()
  @ApiProperty()
  jobTitle: string;

  @Column({ type: 'varchar', array: true, default: [] })
  @ApiProperty({ type: [String], example: ['JavaScript', 'Node.js'] })
  skills: string[];

  @Column({ type: 'smallint' })
  @ApiProperty()
  yearsOfExperience: number;

  @OneToMany(() => Experience, (experience) => experience.profile, {
    cascade: true,
  })
  @ApiProperty({ type: () => [Experience] })
  experiences: Experience[];

  @Column({ type: 'boolean' })
  @ApiProperty()
  graduatedFromCS: boolean;

  @OneToMany(() => Education, (education) => education.profile, {
    cascade: true,
  })
  @ApiProperty({ type: () => [Education] })
  educations: Education[];

  @Column({ type: 'text', array: true, default: [] })
  @ApiProperty({ type: [String], example: ['English', 'Spanish'] })
  languages: string[];

  @OneToMany(() => Project, (project) => project.profile, { cascade: true })
  @ApiProperty({ type: () => [Project] })
  projects: Project[];

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  summary: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @ApiProperty()
  cv: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  linkedIn: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  gitHub: string;

  @OneToMany(() => Certificate, (certificate) => certificate.profile, {
    cascade: true,
  })
  @ApiProperty({ type: () => [Certificate] })
  certificates: Certificate[];
}

