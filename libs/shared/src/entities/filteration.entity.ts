import { Entity, Column, PrimaryColumn, Index, Unique } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { StageType } from '../enums/stage-type.enum';

export interface QuizData {
  grade: number;
  quizDate: Date;
}

export interface InterviewData {
  answers: string[];
  grade: number;
  interviewDate: Date;
}

export interface MatchData {
  // match score of the ATS
  matchScore: number;
  // flag to indicate if the profile passed the custom filter
  isValid: boolean;
}

export interface AppliedData {
  appliedAt: Date;
}

export interface SelectionData { 
  selectedAt: Date;
}

// Union type for all possible stage data
export type StageData = QuizData | InterviewData | MatchData | AppliedData | SelectionData;


@Entity()
@Unique(['jobId', 'profileId'])
export class Filteration extends AbstractEntity {

  @Index()
  @PrimaryColumn()
  @Column({ type: 'uuid', nullable: false })
  jobId: string;

  @Index()
  @PrimaryColumn()
  @Column({ type: 'uuid', nullable: false })
  profileId: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isQualified: boolean;

  @Column({ type: 'json', nullable: true })
  matchData: MatchData;

  @Column({ type: 'json', nullable: true })
  quizData: QuizData;
  
  @Column({ type: 'json', nullable: true })
  interviewData: InterviewData;
  
  @Column({ type: 'json', nullable: true })
  appliedData: AppliedData;

  @Column({ type: 'json', nullable: true })
  selectionData: SelectionData;

  @Column({ type: 'enum', enum: StageType, default: StageType.matched })
  currentStage: StageType;

  @Column({ type: 'boolean', nullable: false, default: false })
  isClosed: boolean;
}
