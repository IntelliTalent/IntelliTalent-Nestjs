import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceName } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateQuizDto,
  GetUserQuizzesDto,
  IQuizzesGeneratorDto,
  JobQuizzesIdentifierDto,
  QuizIdentifierDto,
  quizzesGeneratorPattern,
  SubmitQuizDto,
} from '@app/services_communications';
import { firstValueFrom } from 'rxjs';
import {
  GeneratedQuiz,
  GeneratedQuizQuestion,
} from '@app/services_communications/quizzes/interfaces/quiz.interface';
import { Quiz } from '@app/shared/entities/quiz.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @Inject(ServiceName.QUIZ_GENERATOR_SERVICE)
    private readonly quizzesService: ClientProxy,
  ) {
    // for (let i = 0; i < 30; i++) {
    //   // create array from 1 to 8708dsdssd
    //   const usersIds = Array.from({ length: 27 }, (_, i) => (i + 1).toString());
    //   const deadline = new Date();
    //   deadline.setDate(deadline.getDate() + 2);
    //   this.createQuiz({
    //     jobId: i.toString(),
    //     usersIds: usersIds,
    //     skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
    //     numberOfQuestions: 5,
    //     recruiterId: '1',
    //     deadline,
    //     name: 'Quiz ' + i,
    //   });
    // }
  }

  async createQuiz(createQuizDto: CreateQuizDto) {
    const usersIds = createQuizDto.usersIds;

    const payload: IQuizzesGeneratorDto = {
      num_of_contexts: 5,
      number_of_questions_per_context: createQuizDto.numberOfQuestions,
      number_of_quizzes: usersIds.length,
      skills: createQuizDto.skills,
    };

    const rawQuizzes: any[][] = await firstValueFrom(
      this.quizzesService.send(
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
      const user = usersIds[i];

      quizzesEntities.push(
        this.quizRepository.create({
          userId: user,
          questions: quiz.questions.map((question) => ({
            question: question.question,
            answers: question.options,
          })),
          questionsAnswers: quiz.questions.map((question) => question.answer),
          randomSlug: Math.random().toString(36).substring(2, 15),
          ...createQuizDto,
        }),
      );
    }
    await this.quizRepository.save(quizzesEntities);
  }

  async submitQuiz(submitQuiz: SubmitQuizDto): Promise<{ percentage: number }> {
    const { jobId, userId } = Quiz.decodeQuizURL(submitQuiz.quizEncodedId);

    // Retrieve the quiz
    const quiz = await this.quizRepository.findOneBy({
      jobId: jobId,
      userId: userId,
    });

    console.log(quiz);

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
      console.log('userAnswer', userAnswer, questionsAnswers[index]);
      return userAnswer == questionsAnswers[index] ? acc + 1 : acc;
    }, 0);

    quiz.userAnswers = submitQuiz.userAnswers;
    quiz.score = score;
    await this.quizRepository.save(quiz);
    return {
      percentage: (score / questionsAnswers.length) * 100,
    };
  }

  async getQuiz(getQuiz: QuizIdentifierDto) {
    const { jobId, userId } = Quiz.decodeQuizURL(getQuiz.quizEncodedId);

    if (getQuiz.userWhoRequestedId !== userId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    console.log('getQuiz', jobId, userId);

    const quiz = await this.quizRepository.findOne({
      where: {
        userId: userId,
        jobId: jobId,
      },
      select: ['questions'],
    });

    if (quiz.deadline < new Date())
      throw new BadRequestException(
        'The deadline for this quiz has passed. You can not access it anymore.',
      );

    if (!quiz.isTaken) {
      quiz.isTaken = true;
    } else {
      throw new BadRequestException('You have already take this quiz.');
    }

    await this.quizRepository.update(
      { userId: userId, jobId: jobId },
      { isTaken: true },
    );

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

  async getUsersScores(correctQuiz: JobQuizzesIdentifierDto) {
    const jobQuizzesScores = await this.quizRepository.find({
      where: {
        jobId: correctQuiz.jobId,
      },
      select: ['userId', 'recruiterId', 'score', 'questionsAnswers'],
    });

    if (correctQuiz.recruiterId !== jobQuizzesScores[0].recruiterId)
      throw new ForbiddenException('You are not allowed to access this quiz.');

    return jobQuizzesScores.map((quiz) => ({
      userId: quiz.userId,
      percentage: Math.round((quiz.score / quiz.questionsAnswers.length) * 100),
    }));
  }

  async getUserQuizzes(getUserQuizDto: GetUserQuizzesDto) {
    const quezzies = await this.quizRepository.find({
      where: {
        userId: getUserQuizDto.userId,
      },
      select: [
        'userId',
        'jobId',
        'randomSlug',
        'score',
        'deadline',
        'isTaken',
        'name',
      ],
    });

    return quezzies;
  }
}
