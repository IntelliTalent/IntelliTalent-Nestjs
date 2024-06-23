import { Exclude, Expose } from 'class-transformer';
import { parse, stringify } from 'querystring';
import { AfterLoad, Column, Entity, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export interface Question {
  question: string;
  answers: string[];
}

@Entity()
export class Quiz extends AbstractEntity {
  @PrimaryColumn()
  @Exclude()
  userId: string;

  @PrimaryColumn()
  @Exclude()
  jobId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  recruiterId: string;

  @Column({ type: 'varchar' })
  @Exclude()
  randomSlug: string;

  @Column({ type: 'jsonb' })
  questions: Question[];

  @Column({ type: 'simple-array', default: [] })
  questionsAnswers: number[]; // this is the index of the correct answer in the answers array

  @Column({ type: 'simple-array', nullable: true })
  userAnswers: number[];

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ type: 'boolean', default: false })
  isTaken: boolean;

  @Column({ type: "int", default: 0 })
  visitCount: number;


  identifier: string;


  @Expose()
  percentage(): number {
    if (!this.questionsAnswers || !this.score) return undefined;
    return Math.round((this.score / this.questionsAnswers.length) * 100);
  }

  @Expose({})
  @AfterLoad()
  encodedQuizIdentifier(): string {
    if (!this.userId || !this.jobId || !this.randomSlug) return undefined;

    const encodedParams = Buffer.from(
      stringify({
        userId: this.userId,
        jobId: this.jobId,
        randomSlug: this.randomSlug,
      }),
    ).toString('base64');

    this.identifier = encodedParams;

    return encodedParams;
  }

  static decodeQuizURL(encoded: string): { userId: string; jobId: string } {
    const queryString = Buffer.from(encoded, 'base64').toString('utf8');

    const { userId, jobId } = parse(queryString);
    return { userId: userId as string, jobId: jobId as string };
  }
}
