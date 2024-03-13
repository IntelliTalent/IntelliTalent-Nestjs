import { Controller } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateJobDto,
  EditJobDto,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @MessagePattern({ cmd: jobsServicePatterns.createJob })
  createJob(@Payload() newJob: CreateJobDto) {
    return this.jobsService.createJob(newJob);
  }

  @MessagePattern({ cmd: jobsServicePatterns.editJob })
  editJob(@Payload() editJob: EditJobDto) {
    return this.jobsService.editJob(editJob);
  }

  @MessagePattern({ cmd: jobsServicePatterns.getJobById })
  getJobById(jobId: string) {
    return { endpointName: 'get job by id', data: jobId };
  }

  @MessagePattern({ cmd: jobsServicePatterns.getJobs })
  getJobs(pageOptions: PageOptionsDto) {
    return { endpointName: 'get jobs', data: pageOptions };
  }
}
