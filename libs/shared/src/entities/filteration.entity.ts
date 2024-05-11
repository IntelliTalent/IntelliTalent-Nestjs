import { Entity, Column, PrimaryColumn, Index, Unique } from 'typeorm';
import { StageType } from '../enums/stageType.enum';
import { AbstractEntity } from './abstract.entity';

interface QuizData {
  grade: number;
  quizDate: Date;
}

interface InterviewData {
  answers: string[];
  grade: number;
  interviewDate: Date;
}

interface MatchData {
  matchScore: number;
}

interface AppliedData {
  appliedAt: Date;
}

// Union type for all possible stage data
type StageData = QuizData | InterviewData | MatchData | AppliedData;

@Entity()
@Index(['jobId', 'profileId'], { unique: true })
export class Filteration extends AbstractEntity {
  @PrimaryColumn({ type: 'uuid' })
  jobId: string;

  @PrimaryColumn({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isQualified: boolean;

  @Column({ type: 'json', nullable: true })
  stageData: StageData;

  @Column({ type: 'enum', enum: StageType, default: StageType.matched })
  currentStage: StageType;
}
