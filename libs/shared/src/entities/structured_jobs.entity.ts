import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractEntity } from './abstract.enntity';
import { JobPlace, JobType } from './unstructerd_jobs.schema';

@Entity()
export class StructuredJob extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ })
  title: string;
  
  @Column({ })
  company: string;

  @Column({ })
  jobLocation: string;
  
  @Column({ type: "enum", enum: JobType })
  type: JobType;

  @Column({ type: 'json', default: [] })
  skills: string[];

  @Column({ })
  url: string;

  @Column({ })
  description: string;

  @Column({ type: Date })
  publishedAt: Date;

  @Column({ type: "enum", enum: JobPlace })
  jobPlace: JobPlace;

  @Column({ nullable: true })
  neededExperience: number;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  csRequired: boolean;
}
