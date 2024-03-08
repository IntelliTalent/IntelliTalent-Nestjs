import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Interview extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array', { nullable: true, array: true })
  interviewQuestions: string[];

  @Column({ type: 'date' })
  endDate: Date;

  //   @OneToOne(() => CustomJobsStages, (stage) => stage.interview)
  //   stage: CustomJobsStages;
}
