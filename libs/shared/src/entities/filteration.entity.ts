import { Entity, Column, PrimaryColumn, Index, Unique } from 'typeorm';
import { StageType } from '../enums/stageType.enum';
import { AbstractEntity } from './abstract.entity';

interface QuizData {
  grade: number;
  quizDate: Date;
}

interface InterviewData {
  answers: string[];
  interviewDate: Date;
}

interface CustomFilterData {
  answers: string[];
  answerDate: Date;
}

interface MatchData {
  matchScore: number;
}

interface AppliedData {
  appliedAt: Date;
}

// Union type for all possible stage data
type StageData = QuizData | InterviewData | CustomFilterData | MatchData | AppliedData;


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

  @Column({ type: 'jsonb', nullable: true })
  stageData: StageData;

  @Column({ type: 'enum', enum: StageType, default: StageType.matched })
  currentStage: StageType;
}
