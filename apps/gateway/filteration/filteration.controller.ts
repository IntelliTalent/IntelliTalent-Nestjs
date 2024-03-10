import { FilterJobRequestDto } from '@app/services_communications/filteration-service/dtos/requests/filter-job-request.dto';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { GetStageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-stage-response.dto';
import { UpdateStatusResponseDto } from '@app/services_communications/filteration-service/dtos/responses/update-status-response.dto';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { ServiceName } from '@app/shared';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('bearer')
@ApiTags('Filteration Service')
@Controller('filter')
export class ApiFilterationController {
  constructor(
    @Inject(ServiceName.FILTERATION_SERVICE)
    private filterationService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Filter certain job to the users' })
  @Post()
  @ApiOkResponse({
    description: 'filteration of the job under processing ...',
  })
  async filterJob(
    @Body() filterJob: FilterJobRequestDto,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.filterJob,
      },
      {
        jobId: filterJob.jobId,
      },
    );
  }

  @ApiOperation({summary: 'Get all applied users for a certain job'})
  @Get(':jobId')
  @ApiOkResponse({
    type: GetAppliedUsersResponseDto,
    description: 'The applied users for the job',
  })
  async getAppliedUsers(
    @Param('jobId') jobId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getAppliedUsers,
      },
      {
        jobId: jobId,
      },
    );
  }

  @ApiOperation({summary: 'Get the stage of a certain user in a certain job'})
  @Get(':jobId/:userId')
  @ApiOkResponse({
    description: 'The stage of the user in the job',
    type: GetStageResponseDto,
  })
  async getStage(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ){
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getUserStage,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

  @ApiOperation({summary: 'Pass the quiz stage for a certain user in a certain job'})
  @Post(':jobId/:userId/pass-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Interview',
    type: UpdateStatusResponseDto
  })
  async passQuiz(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.passQuiz,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

  @ApiOperation({summary: 'Fail the quiz stage for a certain user in a certain job'})
  @Post(':jobId/:userId/fail-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Applied',
    type: UpdateStatusResponseDto
  })
  async failQuiz(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.failQuiz,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

  @ApiOperation({summary: 'Pass the interview stage for a certain user in a certain job'})
  @Post(':jobId/:userId/pass-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Matched',
    type: UpdateStatusResponseDto
  })
  async passInterview(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.passInterview,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

  @ApiOperation({summary: 'Fail the interview stage for a certain user in a certain job'})
  @Post(':jobId/:userId/fail-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Applied',
    type: UpdateStatusResponseDto
  })
  async failInterview(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.failInterview,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

}
