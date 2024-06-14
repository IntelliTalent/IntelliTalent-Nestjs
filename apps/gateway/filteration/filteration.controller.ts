import { ApplyJobRequest } from '@app/services_communications/filteration-service/dtos/requests/apply-job-request.dto';
import { AuthInterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-interview-answers.dto';
import { AuthQuizDto } from '@app/services_communications/filteration-service/dtos/requests/auth-quiz.dto';
import { AuthReviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-review-answers.dto';
import { GetInterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/get-interview-answers.dto';
import { GetInterviewQuestionsDto } from '@app/services_communications/filteration-service/dtos/requests/get-interview-questions.dto';
import { InterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/interview-answers.dto';
import { JobDto } from '@app/services_communications/filteration-service/dtos/requests/job.dto';
import { PaginatedJobDto } from '@app/services_communications/filteration-service/dtos/requests/paginated-job.dto';
import { PaginatedMatchedJobDto } from '@app/services_communications/filteration-service/dtos/requests/paginated-matched-job.dto';
import { QuizDto } from '@app/services_communications/filteration-service/dtos/requests/quiz.dto';
import { ReviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/review-answers.dto';
import { GetAppliedJobsDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-jobs-response.dto';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { GetDetailedAppliedUsersDto } from '@app/services_communications/filteration-service/dtos/responses/get-detailed-applied-users.dto';
import { GetInterviewAnswersResponse } from '@app/services_communications/filteration-service/dtos/responses/get-interview-answers-response.dto';
import { GetInterviewQuestionsResponse } from '@app/services_communications/filteration-service/dtos/responses/get-interview-questions.dto';
import { GetMatchedJobsDto } from '@app/services_communications/filteration-service/dtos/responses/get-matched-jobs.dto';
import { GetStageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-stage-response.dto';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { CurrentUser, Roles, ServiceName, User, UserType } from '@app/shared';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
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
  @Roles([UserType.jobSeeker])
  @ApiOkResponse({
    description: 'filteration of the job under processing ...',
    type: StageResponseDto
  })
  async filterJob(
    @Body() filterJob: ApplyJobRequest,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.filterJob,
      },
      {
        userId: user.id,
        profileId: filterJob.profileId,
        jobId: filterJob.jobId,
      } as ApplyJobRequest,
    );
  }

  @ApiOperation({ summary: 'Begin the current stage for a certain job' })
  @Post('begin')
  @ApiOkResponse({
    description: 'The current stage has been started',
    type: StageResponseDto
  })
  async beginCurrentStage(
    @Body() dto: JobDto,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.beginCurrentStage,
      },
      {
        jobId: dto.jobId,
      } as JobDto,
    );
  }

  @ApiOperation({ summary: 'Get the matched jobs of certain profile' })
  @Get('matched-jobs/:profileId')
  @ApiOkResponse({
    description: 'The matched jobs of the profile',
    type: GetMatchedJobsDto
  })
  async getMatchedJobs(
    @CurrentUser() user: User,
    @Param('profileId') profileId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    console.log('getMatchedJobs', profileId);
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getMatchedJobs,
      },
      {
        userId: user.id,
        profileId,
        page,
        limit,
      } as PaginatedMatchedJobDto,
    );
  }

  @ApiOperation({ summary: 'Get the applied jobs for certain profile' })
  @Get('applied-jobs/:profileId')
  @ApiOkResponse({
    description: 'The applied jobs of the profile',
    type: GetAppliedJobsDto
  })
  async getAppliedJobs(
    @CurrentUser() user: User,
    @Param('profileId') profileId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    console.log('getMatchedJobs', profileId);
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getAppliedJobs,
      },
      {
        userId: user.id,
        profileId,
        page,
        limit,
      } as PaginatedMatchedJobDto,
    );
  }

  @ApiOperation({ summary: 'Get the interview questions of the job' })
  @Get('interview/:jobId')
  @ApiOkResponse({
    description: 'The interview questions of the job',
    type: GetInterviewQuestionsResponse
  })
  async getInterviewQuestions(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getInterviewQuestions,
      },
      {
        userId: user.id,
        jobId,
      } as GetInterviewQuestionsDto,
    );
  }

  @ApiOperation({ summary: 'Get the applied users for the job' })
  @Get('applied-users/:jobId')
  @ApiOkResponse({
    description: 'The applied users for the job',
    type: GetDetailedAppliedUsersDto
  })
  async getJobApplicants(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getJobApplicants,
      },
      {
        userId: user.id,
        jobId,
        page, 
        limit
      } as PaginatedJobDto,
    );
  }

  @ApiOperation({ summary: 'Get the interview answers of the user' })
  @Get('interview-answers/:jobId/:profileId')
  @ApiOkResponse({
    description: 'The applied users for the job',
    type: GetInterviewAnswersResponse
  })
  async getInterviewAnswers(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('profileId') profileId: string,
    
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getInterviewAnswers,
      },
      {
        userId: user.id,
        jobId,
        profileId
      } as GetInterviewAnswersDto,
    );
  }

  @ApiOperation({ summary: 'Get all applied users for a certain job' })
  @Get(':jobId')
  @ApiOkResponse({
    type: GetAppliedUsersResponseDto,
    description: 'The applied users for the job',
  })
  async getAppliedUsers(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getAppliedUsers,
      },
      {
        userId: user.id,
        jobId,
        page,
        limit,
      } as PaginatedJobDto,
    );
  }

  @ApiOperation({ summary: 'Get the stage of a certain user in a certain job' })
  @Get(':jobId/:profileId')
  @ApiOkResponse({
    description: 'The stage of the user in the job',
    type:StageResponseDto,
  })
  async getStage(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('profileId') profileId: string,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.getUserStage,
      },
      {
        userId: user.id,
        jobId,
        profileId,
      } as ApplyJobRequest,
    );
  }

  @ApiOperation({ summary: 'Pass the quiz stage for a certain user in a certain job' })
  @Post('pass-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Interview',
    type: StageResponseDto
  })
  async passQuiz(
    @Body() quizDto: QuizDto,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.passQuiz,
      },
      {
        ...quizDto,
        userId: user.id,
      } as AuthQuizDto
    );
  }

  @ApiOperation({ summary: 'Fail the quiz stage for a certain user in a certain job' })
  @Post('fail-quiz')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Applied',
    type: StageResponseDto
  })
  async failQuiz(
    @Body() quizDto: QuizDto,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.failQuiz,
      },
      {
        ...quizDto,
        userId: user.id,
      } as AuthQuizDto
    );
  }

  @ApiOperation({ summary: 'Submit the interview stage for a certain user in a certain job' })
  @Post('submit-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Review',
    type: StageResponseDto
  })
  async submitInterview(
    @Body() interviewAnswers: InterviewAnswersDto,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.submitInterview,
      },
      {
        ...interviewAnswers,
        userId: user.id,
      } as AuthInterviewAnswersDto

    );
  }

  @ApiOperation({ summary: 'Review the interview stage for a certain user in a certain job' })
  @Post('review-interview')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Selected or Failed',
    type: StageResponseDto
  })
  async reviewInterview(
    @Body() reviewAnswers: ReviewAnswersDto,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.reviewInterview,
      },
      { ...reviewAnswers,
        userId: user.id,
      } as AuthReviewAnswersDto,
    );
  }

  @ApiOperation({ summary: 'select certain one as selected profile to the job' })
  @Post('select')
  @ApiOkResponse({
    description: 'Updated the stage of the user to Selected',
    type: StageResponseDto
  })
  async selectProfile(
    @Body() selectProfile: ApplyJobRequest,
    @CurrentUser() user: User,
  ) {
    return this.filterationService.send(
      {
        cmd: FilterationServicePattern.selectProfile,
      },
      {
        ...selectProfile,
        userId: user.id,
      } as ApplyJobRequest,
    );
  }

}
