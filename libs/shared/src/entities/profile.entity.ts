import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Profile extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
  })
  userId: string;

  @Column({})
  jobTitle: string;

  @Column({
    type: 'json',
    default: [],
  })
  skills: string[];

  @Column({
    type: 'smallint',
  })
  yearsOfExperience: number;

  @OneToMany(() => Experience, (experience) => experience.profile)
  experiences: Experience[];

  @Column({
    type: 'boolean',
  })
  graduatedFromCS: boolean;

  @OneToMany(() => Education, (education) => education.profile)
  educations: Education[];

  @Column({
    type: 'text',
  })
  languages: string[];

  @OneToMany(() => Project, (project) => project.profile)
  projects: Project[];

  @Column({
    type: 'text',
  })
  summary: string;

  @Column({
    type: 'text',
  })
  cv: string;

  @Column({
    type: 'text',
  })
  linkedIn: string;

  @Column({
    type: 'text',
  })
  gitHub: string;

  @OneToMany(() => Certificate, (certificate) => certificate.profile)
  certificates: Certificate[];
}

@Entity()
export class Experience extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  jobTitle: string;

  @Column({
    type: 'text',
  })
  companyName: string;

  @Column({
    type: 'date',
  })
  startDate: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate: Date;

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(() => Profile, (profile) => profile.experiences)
  profile: Profile;
}

@Entity()
export class Education extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  degree: string;

  @Column({
    type: 'text',
  })
  schoolName: string;

  @Column({
    type: 'date',
  })
  startDate: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate: Date;

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(() => Profile, (profile) => profile.educations)
  profile: Profile;
}

@Entity()
export class Project extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
  })
  skills: string[];

  @ManyToOne(() => Profile, (profile) => profile.projects)
  profile: Profile;
}

@Entity()
export class Certificate extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'text',
  })
  authority: string;

  @Column({
    type: 'date',
  })
  issuedAt: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  validUntil: Date;

  @Column({
    type: 'text',
  })
  url: string;

  @ManyToOne(() => Profile, (profile) => profile.certificates)
  profile: Profile;
}

