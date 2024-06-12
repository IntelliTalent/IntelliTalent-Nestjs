import {
  AUTH_HEADER,
  GetUserQuizzesDto,
  JobQuizzesIdentifierDto,
  QuizIdentifierDto,
  quizzesEvents,
  quizzesPattern,
  ResponseJobQuizzesScore,
  ResponseQuizCardDto,
  ResponseQuizWithAnswersDto,
  ResponseQuizWithoutAnswersDto,
  ResponseSubmitQuiz,
  SubmitQuizDto,
} from '@app/services_communications';
import { CurrentUser, Roles, ServiceName, User, UserType } from '@app/shared';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
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
  @ApiResponse({
    status: 200,
    description: 'All quizzes for this user',
    type: ResponseQuizCardDto,
    isArray: true,
  })
  @Roles([UserType.jobSeeker])
  async getUserQuizzes(@CurrentUser() user: User) {
    const payload: GetUserQuizzesDto = {
      userId: user.id,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getUserQuizzes },
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

  @Get('/job-scores/:jobId')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'get job quizzes scores' })
  @ApiResponse({
    status: 200,
    description: 'Job quizzes scores',
    type: ResponseJobQuizzesScore,
    isArray: true,
  })
  @Roles([UserType.recruiter])
  getJobQuizzesScores(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
  ) {
    const payload: JobQuizzesIdentifierDto = {
      jobId: jobId,
      recruiterId: user.id,
    };

    return this.quizzesService.send(
      { cmd: quizzesPattern.getUsersScores },
      payload,
    );
  }
}
