import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StructuredJob } from "@app/shared";

@Entity()
export class AppliedUsers {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @PrimaryGeneratedColumn('uuid')
  jobId: string;

  @ManyToOne(() => StructuredJob, (job) => job.id)
  @JoinColumn({ name: 'jobId' })
  job: StructuredJob;
}
