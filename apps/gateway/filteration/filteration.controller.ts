import { ApplyJobRequest } from '@app/services_communications/filteration-service/dtos/requests/apply-job-request.dto';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { GetStageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-stage-response.dto';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { CurrentUser, ServiceName } from '@app/shared';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('bearer')
@ApiTags('Filteration Service')
@Controller('filter')
export class ApiFilterationController {
  constructor(
    @Inject(ServiceName.FILTERATION_SERVICE)
    private filterationService: ClientProxy,
  ) { }

  @ApiOperation({ summary: 'Filter certain job to the users' })
  @Post()
  @ApiOkResponse({
    description: 'filteration of the job under processing ...',
  })
  /**
   * This function is responsible for applying the user to a certain job and setting the stage to applied
   * The cases the function should handle are:
   *  - if the user applied to the job before, the function should throw an error
   *  - if the user didn't apply to the job before:
   *   - if the user is matched to the job and passed the the match score and custom filters the function should update the stage to applied
   *   - if the user is matched to the job and failed the the match score and custom filters the function should update the stage to failed
   * @returns The message of the response, stage type and the stage data of the user
   */
  async filterJob(
    @Body() filterJob: ApplyJobRequest,
    @CurrentUser('id') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.filterJob,
      },
      {
        userId: userId,
        jobId: filterJob.jobId,
      } as ApplyJobRequest,
    );
  }

  @ApiOperation({ summary: 'Get all applied users for a certain job' })
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

  @ApiOperation({ summary: 'Get the stage of a certain user in a certain job' })
  @Get(':jobId/:userId')
  @ApiOkResponse({
    description: 'The stage of the user in the job',
    type: GetStageResponseDto,
  })
  async getStage(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
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

  @ApiOperation({ summary: 'Pass the quiz stage for a certain user in a certain job' })
  @Post(':jobId/:userId/pass-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Interview',
    type: StageResponseDto
  })
  async passQuiz(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
    @Body('grade') grade: number,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.passQuiz,
      },
      {
        jobId: jobId,
        userId: userId,
        grade
      },
    );
  }

  @ApiOperation({ summary: 'Fail the quiz stage for a certain user in a certain job' })
  @Post(':jobId/:userId/fail-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Applied',
    type: StageResponseDto
  })
  async failQuiz(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
    @Body('grade') grade: number,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.failQuiz,
      },
      {
        jobId: jobId,
        userId: userId,
        grade
      },
    );
  }

  @ApiOperation({ summary: 'Pass the interview stage for a certain user in a certain job' })
  @Post(':jobId/:userId/pass-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Matched',
    type: StageResponseDto
  })
  async passInterview(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
    @Body('answers') answers: string[],
    @Body('grade') grade: number,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.passInterview,
      },
      {
        jobId: jobId,
        userId: userId,
        answers,
        grade
      },
    );
  }

  @ApiOperation({ summary: 'Fail the interview stage for a certain user in a certain job' })
  @Post(':jobId/:userId/fail-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Applied',
    type: StageResponseDto
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

  @ApiOperation({ summary: 'select certain one as selected profile to the job' })
  @Post(':jobId/:userId/select')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Selected',
    type: StageResponseDto
  })
  async selectProfile(
    @Param('jobId') jobId: string,
    @Param('userId') userId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.selectProfile,
      },
      {
        jobId: jobId,
        userId: userId,
      },
    );
  }

}
