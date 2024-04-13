import {
  CreateJobDto,
  EditJobDto,
  IJobs,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { ServiceName } from '@app/shared';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';

// TODO: Add user authentication and edit create job with the userId and edit edit job set each parameter manually

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(ServiceName.JOB_SERVICE)
    private jobsService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({
    status: 200,
    type: IJobs,
    isArray: true,
    description: 'List of jobs returned successfully.',
  })
  async getJobs(@Query() filteration: PageOptionsDto) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.getJobs },
      filteration,
    );
  }

  @Get('/:jobId')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiResponse({
    status: 200,
    type: IJobs,
    description: 'Job details returned successfully.',
  })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  async getJobById(@Param('jobId') jobId: string) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.getJobById },
      jobId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create new job' })
  @ApiBody({ type: CreateJobDto, description: 'New job details' })
  @ApiCreatedResponse({ description: 'New job created.' })
  @Public()
  async createJob(@Body() newJob: CreateJobDto) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.createJob },
      newJob,
    );
  }

  @Put('/:jobId')
  @ApiOperation({ summary: 'Update job by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiBody({ type: EditJobDto, description: 'Updated job details' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully.',
  })
  @ApiNotFoundResponse({ description: 'Job not found' })
  async updateJob(@Param('jobId') jobId: string, @Body() editJob: EditJobDto) {
    editJob.jobId = jobId;
    return this.jobsService.send({ cmd: jobsServicePatterns.editJob }, editJob);
  }
}
