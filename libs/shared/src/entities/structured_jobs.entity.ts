import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { JobPlace, JobType } from './unstructerd_jobs.schema';
import { CustomJobsStages } from './custom_jobs_stages.entity';

export enum StageType {
  Active = 'Active',
  Quiz = 'Quiz',
  Interview = 'Interview',
  Final = 'Final',
}

@Entity()
@Index(['title', 'company', 'publishedAt'], { unique: true })
export class StructuredJob extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobId: string; // id for the job from the websites (linkedin, etc.)

  @Column({ nullable: true })
  userId: string; // id for the recruiter

  @Column({})
  title: string;

  @Column({})
  company: string;

  @Column({})
  jobLocation: string;

  @Column({ type: 'enum', enum: JobType })
  type: JobType;

  @Column({ type: 'json', default: [] })
  skills: string[];

  @Column({})
  url: string;

  @Column({})
  description: string;

  @Column({ type: Date })
  publishedAt: Date;

  @Column({ type: 'enum', enum: JobPlace, nullable: true })
  jobPlace: JobPlace;

  @Column({ nullable: true })
  neededExperience: number;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  csRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isScrapped: boolean;

  @Column({ type: Date, nullable: true })
  jobEndDate: Date;

  @Column({ type: 'enum', enum: StageType, default: StageType.Active })
  currentStage: StageType;

  @OneToOne(() => CustomJobsStages)
  @JoinColumn()
  stages: CustomJobsStages;
}
