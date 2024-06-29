import {
  ClassSerializerInterceptor,
  Controller,
  SerializeOptions,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ActivateQuizDto,
  CreateQuizDto,
  GetQuizSlugsDto,
  GetUserQuizzesDto,
  JobQuizzesIdentifierDto,
  PaginatedJobQuizzesIdentifierDto,
  QuizIdentifierDto,
  quizzesEvents,
  quizzesPattern,
  SubmitQuizDto,
} from '@app/services_communications/quizzes';
import { RpcExceptionsFilter } from '@app/shared';

@Controller()
@UseFilters(RpcExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {
    // this.quizzesService.activateQuiz({
    //   jobId: 'b66f211a-8f97-4b34-a0cf-1f843d4826d0'
    // })
  }

  @MessagePattern({ cmd: quizzesPattern.getQuizSlugs })
  @SerializeOptions({
    ignoreDecorators: true,
  })
  async getQuizSlugs(@Payload() getQuiz: GetQuizSlugsDto) {
    const quizzes = await this.quizzesService.getQuizSlugs(getQuiz);
    return quizzes;
  }

  @MessagePattern({ cmd: quizzesPattern.getUserQuizzes })
  async getUserQuizzes(@Payload() getUserQuizDto: GetUserQuizzesDto) {
    return this.quizzesService.getUserQuizzes(getUserQuizDto);
  }

  @MessagePattern({ cmd: quizzesPattern.getQuiz })
  async getQuiz(@Payload() getQuiz: QuizIdentifierDto) {
    return this.quizzesService.getQuiz(getQuiz);
  }

  @MessagePattern({ cmd: quizzesEvents.activateQuiz })
  async activateQuiz(@Payload() activateQuiz: ActivateQuizDto) {
     this.quizzesService.activateQuiz(activateQuiz);
  }

  @MessagePattern({ cmd: quizzesEvents.submitQuiz })
  async submitQuiz(@Payload() submitQuiz: SubmitQuizDto) {
    return this.quizzesService.submitQuiz(submitQuiz);
  }

  @MessagePattern({ cmd: quizzesPattern.getQuizWithAnswers })
  async getQuizWithAnswers(@Payload() getQuiz: QuizIdentifierDto) {
    return this.quizzesService.getQuizWithAnswers(getQuiz);
  }

  @MessagePattern({ cmd: quizzesPattern.getUsersScores })
  async getUsersScores(@Payload() correctQuiz: PaginatedJobQuizzesIdentifierDto) {
    return this.quizzesService.getUsersScores(correctQuiz);
  }

  @EventPattern({ cmd: quizzesEvents.createQuiz })
  async createQuiz(@Payload() createQuizDto: CreateQuizDto) {
    return this.quizzesService.createQuiz(createQuizDto);
  }
}
