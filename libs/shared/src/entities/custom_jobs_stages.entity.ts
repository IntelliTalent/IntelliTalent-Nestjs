import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Interview } from './interview.entity';

export interface CustomFilters {
  languages?: string[];
  country?: string;
  city?: string;
}

@Entity()
export class CustomJobsStages extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Interview, {
    cascade: true,
  })
  @JoinColumn()
  interview: Interview;

  @Column({ type: 'json', nullable: true })
  customFilters: CustomFilters;

  @Column({ type: 'date', nullable: true })
  quizEndDate: Date;
}
