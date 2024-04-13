import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Interview extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json', default: [] })
  interviewQuestions: string[];

  @Column({ type: 'date' })
  endDate: Date;
}
