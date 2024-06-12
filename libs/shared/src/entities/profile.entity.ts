import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Profile extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty()
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

  @Column()
  @ApiProperty()
  description: string;

  @ManyToOne(() => Profile, (profile) => profile.educations)
  profile: Profile;
}

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

  @Column()
  @ApiProperty()
  size: number;
}

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
