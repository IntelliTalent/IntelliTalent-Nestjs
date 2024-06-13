import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';

export class EditJobDto extends PartialType(CreateJobDto) {
  jobId?: string;
}
