import { AbstractEntity } from './abstract.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Matching extends AbstractEntity {
  @PrimaryColumn({ type: 'uuid' })
  jobId: string;

  @PrimaryColumn({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'float' })
  score: number;
}
