import { Controller, UseFilters } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateJobDto,
  EditJobDto,
  jobsServiceEvents,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RpcExceptionsFilter } from '@app/shared';
import { JobsPageOptionsDto } from '@app/services_communications/jobs-service/dtos/get-jobs.dto';
import { GetUserJobsDto } from '@app/services_communications/jobs-service/dtos/get-user-jobs.dto';
import { ApplyJobDto } from '@app/services_communications';

@Controller()
@UseFilters(RpcExceptionsFilter)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  checkActiveJobs() {
    this.jobsService.checkActiveJobs();
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  callJobExtractor() {
    this.jobsService.callJobExtractor();
  }

  @MessagePattern({ cmd: jobsServicePatterns.createJob })
  createJob(@Payload() newJob: CreateJobDto) {
    return this.jobsService.createJob(newJob);
  }

  @MessagePattern({ cmd: jobsServicePatterns.editJob })
  editJob(@Payload() editJob: EditJobDto) {
    return this.jobsService.editJob(editJob);
  }

  @MessagePattern({ cmd: jobsServicePatterns.getJobById })
  getJobById({ jobId, userId = null }: { jobId: string; userId: string }) {
    return this.jobsService.getJobById(jobId, userId);
  }

  @MessagePattern({ cmd: jobsServicePatterns.getJobDetailsById })
  getJobDetailsById({ jobId, userId = null }: { jobId: string; userId: string }) {
    return this.jobsService.getJobDetailsById(jobId, userId);
  }

  @MessagePattern({ cmd: jobsServicePatterns.getJobs })
  getJobs(pageOptions: JobsPageOptionsDto) {
    return this.jobsService.getJobs(pageOptions);
  }

  @MessagePattern({ cmd: jobsServicePatterns.getUserJobs })
  getUserJobs(@Payload() getUserJobsDto: GetUserJobsDto) {
    return this.jobsService.getUserJobs(getUserJobsDto);
  }

  @MessagePattern({ cmd: jobsServicePatterns.deactivateJob })
  deactivateJob({ jobId, userId }: { jobId: string; userId: string }) {
    return this.jobsService.deactivateJob(jobId, userId);
  }

  @MessagePattern({ cmd: jobsServicePatterns.moveToNextStage })
  moveToNextStage({ jobId, userId }: { jobId: string; userId: string }) {
    return this.jobsService.moveToNextStage(jobId, userId);
  }

  @EventPattern({ cmd: jobsServiceEvents.userApply })
  userApply(applyDro: ApplyJobDto) {
    this.jobsService.userApply(applyDro);
  }
}
