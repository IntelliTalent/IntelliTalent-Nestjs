import {
  AUTH_HEADER,
  GetUserQuizzesDto,
  JobQuizzesIdentifierDto,
  PaginatedJobQuizzesIdentifierDto,
  QuizIdentifierDto,
  quizzesEvents,
  quizzesPattern,
  ResponseJobQuizzesScore,
  ResponseQuizCardDto,
  ResponseQuizWithAnswersDto,
  ResponseQuizWithoutAnswersDto,
  ResponseSubmitQuiz,
  SubmitQuizDto,
  UserQuizzesStatisticsDto,
} from '@app/services_communications';
import { ResponseQuizStatisticsDto } from '@app/services_communications/quizzes/dtos/response-quiz-statistics.dto';
import { ApiPaginatedResponse, CurrentUser, Roles, ServiceName, User, UserType } from '@app/shared';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiResponseProperty,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(
    @Inject(ServiceName.QUIZ_SERVICE) private quizzesService: ClientProxy,
  ) {}

  @Get('/my-quizzes')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get all quizzes for this user' })
  @ApiPaginatedResponse(ResponseQuizCardDto)
  @Roles([UserType.jobSeeker])
  async getUserQuizzes(
    @CurrentUser() user: User,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const payload: GetUserQuizzesDto = {
      userId: user.id,
      pageOptionsDto
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getUserQuizzes },
      payload,
    );
  }


  @Get('/my-quizzes-statistics')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get user quizzes statistics' })
  @ApiResponse({
    status: 200,
    description: 'User quizzes statistics',
    type: ResponseQuizStatisticsDto,
  })
  @Roles([UserType.jobSeeker])
  async getUserQuizzesStatistics(
    @CurrentUser() user: User,
  ) {
    const payload: UserQuizzesStatisticsDto = {
      userId: user.id,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getQuizzesStats },
      payload,
    );
  }




  @Get('/:identifier')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get a quiz by identifier' })
  @ApiResponse({
    status: 200,
    description: 'A quiz by identifier',
    type: ResponseQuizWithoutAnswersDto,
  })
  @Roles([UserType.jobSeeker])
  getQuiz(@Param('identifier') identifier: string, @CurrentUser() user: User) {
    const payload: QuizIdentifierDto = {
      quizEncodedId: identifier,
      userWhoRequestedId: user.id,
    };
    return this.quizzesService.send({ cmd: quizzesPattern.getQuiz }, payload);
  }

  @Post('/submit/:identifier')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'submit a quiz' })
  @ApiResponse({
    status: 201,
    description: 'Submit a quiz',
    type: ResponseSubmitQuiz,
  })
  @Roles([UserType.jobSeeker])
  submitQuiz(
    @Param('identifier') identifier: string,
    @Body() submitPayloadDto: SubmitQuizDto,
    @CurrentUser() user: User,
  ) {
    const payload: SubmitQuizDto = {
      ...submitPayloadDto,
      quizEncodedId: identifier,
      userWhoRequestedId: user.id,
    };

    return this.quizzesService.send({ cmd: quizzesEvents.submitQuiz }, payload);
  }

  @Get('/answers/:identifier')
  @Roles([UserType.jobSeeker])
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get a quiz with answers' })
  @ApiResponse({
    status: 200,
    description: 'A quiz with answers',
    type: ResponseQuizWithAnswersDto,
  })
  getQuizWithAnswers(
    @Param('identifier') identifier: string,
    @CurrentUser() user: User,
  ) {
    const payload: QuizIdentifierDto = {
      quizEncodedId: identifier,
      userWhoRequestedId: user.id,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getQuizWithAnswers },
      payload,
    );
  }

  @Get('/job-slugs/:jobId')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get job quizzes slugs' })
  @ApiResponse({
    status: 200,
    description: 'Job quizzes slugs',
    type: ResponseJobQuizzesScore,
    isArray: true,
  })
  @Roles([UserType.recruiter])
  getSlugs(
    @CurrentUser() user: User,
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const payload: JobQuizzesIdentifierDto = {
      jobId: jobId,
      recruiterId: user.id,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getQuizSlugs },
      payload,
    );
  }

  @Get('/job-scores/:jobId')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get job quizzes scores' })
  @Roles([UserType.recruiter])
  @ApiPaginatedResponse(ResponseJobQuizzesScore)
  getJobQuizzesScores(
    @CurrentUser() user: User,
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const payload: PaginatedJobQuizzesIdentifierDto = {
      jobId: jobId,
      recruiterId: user.id,
      pageOptionsDto: pageOptionsDto,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getUsersScores },
      payload,
    );
  }
}
