import { AUTH_HEADER } from '@app/services_communications';
import {
  CreateJobDto,
  EditJobDto,
  IJobs,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { JobsPageOptionsDto } from '@app/services_communications/jobs-service/dtos/get-jobs.dto';
import {
  CurrentUser,
  Roles,
  ServiceName,
  StructuredJob,
  User,
  UserType,
} from '@app/shared';
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
  Patch,
  ParseUUIDPipe,
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
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(ServiceName.JOB_SERVICE)
    private jobsService: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({
    status: 200,
    type: IJobs,
    isArray: true,
    description: 'List of jobs returned successfully.',
  })
  async getJobs(@Query() filteration: JobsPageOptionsDto) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.getJobs },
      filteration,
    );
  }

  @Get('/:jobId')
  @Public()
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiResponse({
    status: 200,
    type: IJobs,
    description: 'Job details returned successfully.',
  })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  async getJobById(@Param('jobId', new ParseUUIDPipe()) jobId: string) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.getJobById },
      jobId,
    );
  }

  @Get('/:jobId/details')
  @Public()
  @ApiOperation({ summary: 'Get job details by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiResponse({
    status: 200,
    type: StructuredJob,
    description: 'Job details returned successfully.',
  })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  async getJobDetailsById(@Param('jobId', new ParseUUIDPipe()) jobId: string) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.getJobDetailsById },
      jobId,
    );
  }

  @Post()
  @Roles([UserType.recruiter])
  @ApiOperation({ summary: 'Create new job' })
  @ApiBody({ type: CreateJobDto, description: 'New job details' })
  @ApiCreatedResponse({ description: 'New job created.' })
  @ApiBearerAuth(AUTH_HEADER)
  async createJob(@Body() newJob: CreateJobDto, @CurrentUser() user: User) {
    newJob.userId = user.id;

    return this.jobsService.send(
      { cmd: jobsServicePatterns.createJob },
      newJob,
    );
  }

  @Put('/:jobId')
  @Roles([UserType.recruiter])
  @ApiOperation({ summary: 'Update job by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiBody({ type: EditJobDto, description: 'Updated job details' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully.',
  })
  @ApiBearerAuth(AUTH_HEADER)
  @ApiNotFoundResponse({ description: 'Job not found' })
  async updateJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
    @Body() editJob: EditJobDto,
    @CurrentUser() user: User,
  ) {
    editJob.jobId = jobId;
    editJob.userId = user.id;
    return this.jobsService.send({ cmd: jobsServicePatterns.editJob }, editJob);
  }

  @Patch('/:jobId/deactivate')
  @Roles([UserType.recruiter])
  @ApiOperation({ summary: 'Deactivate job by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job deactivated successfully.',
  })
  @ApiBearerAuth(AUTH_HEADER)
  @ApiNotFoundResponse({ description: 'Job not found' })
  async deactivateJob(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.deactivateJob },
      { jobId, userId: user.id },
    );
  }

  @Patch('/:jobId/move-to-next-stage')
  @Roles([UserType.recruiter])
  @ApiOperation({ summary: 'Move job to next stage by ID' })
  @ApiParam({ name: 'jobId', type: String, description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job moved to next stage successfully.',
  })
  @ApiBearerAuth(AUTH_HEADER)
  @ApiNotFoundResponse({ description: 'Job not found' })
  async moveToNextStage(
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.send(
      { cmd: jobsServicePatterns.moveToNextStage },
      { jobId, userId: user.id },
    );
  }
}
