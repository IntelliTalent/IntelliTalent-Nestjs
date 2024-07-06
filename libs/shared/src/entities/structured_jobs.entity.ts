import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  Index,
  BeforeInsert,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { JobPlace, JobType } from './unstructerd_jobs.schema';
import { CustomJobsStages } from './custom_jobs_stages.entity';
import { Expose } from 'class-transformer';
import { AppliedUsers } from './applied-users.entity';

export enum StageType {
  Active = 'Active',
  Quiz = 'Quiz',
  Interview = 'Interview',
  Final = 'Final',
}

export enum JobSource {
  IntelliTalent = 0,
  LinkedIn = 1,
  Wuzzuf = 2,
}

@Entity({})
@Index(['title', 'company', 'publishedAt'], { unique: true })
@Index('sourceIndex', ['source', 'jobId'])
export class StructuredJob extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobId: string; // id for the job from the websites (linkedin, etc.)

  @Column({ nullable: true })
  userId: string; // id for the recruiter

  @Column({ type: 'enum', enum: JobSource, default: JobSource.IntelliTalent })
  source: JobSource;

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

  @OneToOne(() => CustomJobsStages, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  stages: CustomJobsStages;

  @OneToMany(() => AppliedUsers, (appliedUsers) => appliedUsers.job, {
    cascade: true,
  })
  appliedUsers: AppliedUsers[];

  @BeforeInsert()
  setSource() {
    this.source = StructuredJob.getJobSource(this.url);
  }

  @Expose()
  get jobSource(): string {
    const key = Object.keys(JobSource).find(
      (key) => JobSource[key] === this.source,
    );
    return key;
  }

  static getJobSource(url: string): JobSource {
    switch (true) {
      case url.includes('linkedin'):
        return JobSource.LinkedIn;
      case url.includes('wuzzuf'):
        return JobSource.Wuzzuf;
      default:
        return JobSource.IntelliTalent;
    }
  }

  static getJobSourceFromEnum(source: JobSource): string {
    return Object.keys(JobSource).find((key) => {
      console.log(JobSource[key], source);
      return JobSource[key] == source
    });
  }

}


