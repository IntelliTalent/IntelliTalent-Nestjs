import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceName } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
  ActivateQuizDto,
  CreateQuizDto,
  GetQuizSlugsDto,
  GetUserQuizzesDto,
  IQuizzesGeneratorDto,
  PaginatedJobQuizzesIdentifierDto,
  QuizIdentifierDto,
  quizzesGeneratorPattern,
  RemoveProfileQuizzesDto,
  SubmitQuizDto,
  UserQuizzesStatisticsDto,
} from '@app/services_communications';
import { firstValueFrom } from 'rxjs';
import {
  GeneratedQuiz,
  GeneratedQuizQuestion,
} from '@app/services_communications/quizzes/interfaces/quiz.interface';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { applyQueryOptions } from '@app/shared/api-features/apply_query_options';
import { v4 as uuidv4 } from 'uuid';
import { ResponseQuizStatisticsDto } from '@app/services_communications/quizzes/dtos/response-quiz-statistics.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @Inject(ServiceName.QUIZ_GENERATOR_SERVICE)
    private readonly quizzesGenerator: ClientProxy,
  ) {
    // const jobUUID = uuidv4();
    // for (let i = 0; i < 30; i++) {
    //   // create array from 1 to 8708dsdssd
    //   const usersDetails: UserQuizDetailsDto[] = Array.from(
    //     { length: 1 },
    //     (_, i) => {
    //       return {
    //         userId: '0183de39-2c51-4708-a683-dcb95425a42d',
    //         email: 'test' + i + '@test.com',
    //       };
    //     },
    //   );
    //   const deadline = new Date();
    //   deadline.setDate(deadline.getDate() + 2);
    //   console.log()
    //   this.createQuiz({
    //     jobId: uuidv4(),
    //     skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
    //     numberOfQuestions: 5,
    //     recruiterId: '1',
    //     deadline,
    //     name: 'Quiz ' + i,
    //     usersDetails,
    //   });
    // }
  }

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz[]> {
    const { usersDetails } = createQuizDto;

    const payload: IQuizzesGeneratorDto = {
      num_of_contexts: 5,
      number_of_questions_per_context: createQuizDto.numberOfQuestions,
      number_of_quizzes: usersDetails.length,
      skills: createQuizDto.skills,
    };

    const rawQuizzes: any[][] = await firstValueFrom(
      this.quizzesGenerator.send(
        { cmd: quizzesGeneratorPattern.generateQuizzes },
        payload,
      ),
    );

    const quizzes: GeneratedQuiz[] = rawQuizzes.map((quiz) => {
      // loop over quiz questuions
      const questions: GeneratedQuizQuestion[] = quiz.map((question) => {
        return {
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation,
          codeblock: question.codeblock,
          context: question.context,
        };
      });
      const generatedQuiz: GeneratedQuiz = {
        questions,
      };
      return generatedQuiz;
    });

    const quizzesEntities = [];
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i] as GeneratedQuiz;
      const userDetails = usersDetails[i];

      quizzesEntities.push(
        this.quizRepository.create({
          userId: userDetails.userId,
          email: userDetails.email,
          questions: quiz.questions.map((question) => ({
            question: question.question,
            answers: question.options,
          })),
          questionsAnswers: quiz.questions.map((question) => question.answer),
          randomSlug: Math.random().toString(36).substring(2, 15),
          ...createQuizDto,
          deletedAt: new Date(),
        }),
      );
    }

    return this.quizRepository.save(quizzesEntities);
  }


  async getQuizzesStats(quizStatisticsDto: UserQuizzesStatisticsDto): Promise<ResponseQuizStatisticsDto> {
    const { userId } = quizStatisticsDto;
    const result = await this.quizRepository.createQueryBuilder('quiz')
    .select('quiz.isTaken', 'isTaken')
    .addSelect('COUNT(*)', 'count')
    .where('quiz.userId = :userId', { userId })
    .groupBy('quiz.isTaken')
    .getRawMany();

    const statistics = {
      notTaken: Number(result.find((r) => r.isTaken === false)?.count) || 0,
      taken: Number(result.find((r) => r.isTaken === true)?.count) || 0,
      total: result.reduce((acc, r) => acc + Number(r.count), 0),
    }

    return statistics;
  }

  async submitQuiz(submitQuiz: SubmitQuizDto): Promise<{ percentage: number }> {
    const { jobId, userId } = Quiz.decodeQuizURL(submitQuiz.quizEncodedId);

    if (!jobId || !userId)
      throw new BadRequestException('Invalid quiz identifier');

    // Retrieve the quiz
    const quiz = await this.quizRepository.findOneBy({
      jobId: jobId,
      userId: userId,
    });

    // validate this is existing quiz
    if (!quiz) throw new NotFoundException('Quiz not found');

    // validate this is the first time to submit this quiz
    if (submitQuiz.userWhoRequestedId !== userId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    if (quiz.userAnswers)
      throw new BadRequestException(
        `You have already submitted this quiz. and your score is ${quiz.score} out of ${quiz.questionsAnswers.length}`,
      );

    const { questionsAnswers } = quiz;

    const score = submitQuiz.userAnswers.reduce((acc, userAnswer, index) => {
      return userAnswer == questionsAnswers[index] ? acc + 1 : acc;
    }, 0);

    quiz.userAnswers = submitQuiz.userAnswers;
    quiz.score = score;
    quiz.isTaken = true;
    await this.quizRepository.save(quiz);
    return {
      percentage: (score / questionsAnswers.length) * 100,
    };
  }

  async getQuiz(getQuiz: QuizIdentifierDto) {
    const { jobId, userId } = Quiz.decodeQuizURL(getQuiz.quizEncodedId);

    if (!jobId || !userId)
      throw new BadRequestException('Invalid quiz identifier');

    if (getQuiz.userWhoRequestedId !== userId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    const quiz = await this.quizRepository.findOne({
      where: {
        userId: userId,
        jobId: jobId,
      },
      select: ['questions', 'visitCount', 'isTaken', 'deadline'],
    });


    if (!quiz) throw new NotFoundException('Quiz not found');


    if(quiz.isTaken) {
      throw new BadRequestException('You have already taken this quiz.');
    }

    if (quiz.deadline < new Date())
      throw new BadRequestException(
        'The deadline for this quiz has passed. You can not access it anymore.',
      );

    if (quiz.visitCount < 3) {

      await this.quizRepository.update(
        { userId: userId, jobId: jobId },
        { visitCount: quiz.visitCount + 1 },
      );

    } else {

      await this.quizRepository.update(
        { userId: userId, jobId: jobId },
        { isTaken: true },
      );

      throw new BadRequestException(
        'You have reached the maximum number of visits for this quiz.',
      );
    }

    return quiz;
  }

  async getQuizWithAnswers(getQuiz: QuizIdentifierDto) {
    const { jobId, userId } = Quiz.decodeQuizURL(getQuiz.quizEncodedId);

    if (getQuiz.userWhoRequestedId !== userId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    const quiz = await this.quizRepository.findOne({
      where: {
        userId: userId,
        jobId: jobId,
      },
      select: {
        questions: true,
        questionsAnswers: true,
        userAnswers: true,
        score: true,
      },
    });

    if (!quiz.userAnswers)
      throw new BadRequestException('You have not taken this quiz yet.');

    return quiz;
  }

  async activateQuiz(jobQuizzesIdentifier: ActivateQuizDto) {
    const { jobId } = jobQuizzesIdentifier;

    await this.quizRepository.restore({ jobId: jobId });
  }

  async getUsersScores(correctQuiz: PaginatedJobQuizzesIdentifierDto) {
    const { page, take } = correctQuiz.pageOptionsDto;
    const jobQuizzesScores = this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.jobId = :jobId', { jobId: correctQuiz.jobId })
      .select([
        'quiz.userId',
        'quiz.recruiterId',
        'quiz.score',
        'quiz.questionsAnswers',
      ]);

    const { data, meta } = await applyQueryOptions(
      jobQuizzesScores,
      correctQuiz.pageOptionsDto,
    );

    if (!data || data.length === 0)
      throw new NotFoundException('No quizzes found for this job.');

    if (correctQuiz.recruiterId !== data[0].recruiterId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    return {
      data: data.map((quiz) => ({
        userId: quiz.userId,
        percentage: Math.round(
          (quiz.score / quiz.questionsAnswers.length) * 100,
        ),
      })),
      meta,
    };
  }

  async getUserQuizzes(getUserQuizDto: GetUserQuizzesDto) {
    const quizzesQuery = this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.userId = :userId', { userId: getUserQuizDto.userId })
      .select([
        'quiz.userId',
        'quiz.jobId',
        'quiz.randomSlug',
        'quiz.score',
        'quiz.deadline',
        'quiz.isTaken',
        'quiz.name',
        'quiz.email',
      ]);
    return applyQueryOptions(quizzesQuery, getUserQuizDto.pageOptionsDto);
  }

  async getQuizSlugs(getQuiz: GetQuizSlugsDto) {
    const quizSlugs = await this.quizRepository.find({
      where: {
        jobId: getQuiz.jobId,
      },
      select: ['randomSlug', 'userId', 'email', 'jobId'],
      withDeleted: true,
    });

    return quizSlugs;
  }


  async removeProfileQuizzes(dto: RemoveProfileQuizzesDto) {
    const { userId, jobsIds } = dto;

    await this.quizRepository.delete({
      userId: userId,
      jobId: In(jobsIds),
    });
  }


}
