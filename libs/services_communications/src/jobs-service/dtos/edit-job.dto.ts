import { CreateJobDto } from './create-job.dto';

export class EditJobDto extends CreateJobDto {
  jobId?: string;
}
