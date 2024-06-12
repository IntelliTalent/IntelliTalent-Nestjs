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
  yearsOfExperience?: number;
  graduatedFromCS?: boolean;
  languages?: string[];
  country?: string;
  city?: string;
}

export enum StageType {
  INTERVIEW = 0,
  QUIZ = 1,
}

@Entity()
export class CustomJobsStages extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Interview,  {
    cascade: true,
  })
  @JoinColumn()
  interview: Interview;

  @Column({ type: 'json', nullable: true })
  customFilters: CustomFilters;

  @Column({ type: 'date', nullable: true })
  quizEndDate: Date;

  @Column({
    type: 'enum',
    enum: StageType,
    array: true,
  })
  order: StageType[];
}
