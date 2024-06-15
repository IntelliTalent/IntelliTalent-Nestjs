import { Test, TestingModule } from '@nestjs/testing';
import {  ServiceName, SharedModule, Token, } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { emit, send } from 'process';
import { of } from 'rxjs';
import { GeneratedQuiz, GeneratedQuizQuestion } from '@app/services_communications';

describe('TokenService', () => {
  let quizzesService: QuizzesService;
  let mockQuizzesGeneratorService: any;
  const questionTemp: GeneratedQuizQuestion = {
    context: 'context',
    question: 'question',
    options: ['option1', 'option2', 'option3', 'option4'],
    answer: 1,
    explanation: 'explanation',
    codeblock: 'codeblock',
  };
  let quiz20;


  beforeEach(async () => {
    const question50 = Array.from({ length: 50 }, (item, index) => {
      const question = { ...questionTemp };
      question.answer = index%4;
      return questionTemp;
    });
    quiz20  = Array.from({ length: 20 }, (item, index) => {
      return question50;
    })

    mockQuizzesGeneratorService = {
      send: jest.fn().mockImplementation(() => of(quiz20)),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Quiz],
          true,
        ),
        TypeOrmModule.forFeature([Quiz]),
      ],
      providers: [
        QuizzesService,
        {
          provide: ServiceName.QUIZ_GENERATOR_SERVICE,
          useValue: mockQuizzesGeneratorService,
        },
      ],
    }).compile();

    quizzesService = module.get<QuizzesService>(QuizzesService);
  });

  it('should be defined', () => {
    expect(quizzesService).toBeDefined();
  });

  it("should create a quiz", async () => {
    const quiz = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });


    expect(quiz).toBeDefined();
    expect(mockQuizzesGeneratorService.send).toHaveBeenCalled();
});

it("should submit a quiz with 100% score", async () => {
  const quizzes = await quizzesService.createQuiz({
    jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
    skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
    numberOfQuestions: 5,
    recruiterId: '1',
    deadline: new Date(),
    name: 'Quiz',
    usersDetails: [
      ...Array.from({ length: 27 }, (_, i) => {
        return {
          userId: i.toString(),
          email: 'test' + i + '@test.com',

        };
      })
    ]
  });

  const targetQuiz = quizzes[1];
  targetQuiz.questionsAnswers

  const result = await quizzesService.submitQuiz({
    quizEncodedId: targetQuiz.encodedQuizIdentifier(),
    userAnswers: targetQuiz.questions.map((question, index) => {
      return targetQuiz.questionsAnswers[index];
    }),
    userWhoRequestedId: targetQuiz.userId,
  });


  expect(result).toBeDefined();
  expect(result.percentage).toBeGreaterThan(0);
  expect(result.percentage).toBe(100);
})

  it("should submit a quiz with 0% score", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];
    targetQuiz.questionsAnswers

    const result = await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return -1;
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    expect(result).toBeDefined();
    expect(result.percentage).toBe(0);
  });


  it("should get a quiz by id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    const result = await quizzesService.getQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userWhoRequestedId: targetQuiz.userId,
    });

    expect(result).toBeDefined();
    expect(result.questions.length).toEqual(targetQuiz.questions.length);
  });

  it("should throw an error when getting a quiz by id that does not exist", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    try {
      await quizzesService.getQuiz({
        quizEncodedId: 'invalid',
        userWhoRequestedId: targetQuiz.userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it("should throw an error when submitting a quiz that does not exist", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    try {
      await quizzesService.submitQuiz({
        quizEncodedId: 'invalid',
        userAnswers: targetQuiz.questions.map((question, index) => {
          return targetQuiz.questionsAnswers[index];
        }),
        userWhoRequestedId: targetQuiz.userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });


  it("should throw an error when submit quiz with different user id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    try {
      await quizzesService.submitQuiz({
        quizEncodedId: targetQuiz.encodedQuizIdentifier(),
        userAnswers: targetQuiz.questions.map((question, index) => {
          return targetQuiz.questionsAnswers[index];
        }),
        userWhoRequestedId: 'invalid',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  })

  it("should throw an error when submit a quiz that is already taken", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    try {
      await quizzesService.submitQuiz({
        quizEncodedId: targetQuiz.encodedQuizIdentifier(),
        userAnswers: targetQuiz.questions.map((question, index) => {
          return targetQuiz.questionsAnswers[index];
        }),
        userWhoRequestedId: targetQuiz.userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });


  it("should not get Quiz with answers unless submit it", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];


    try{

    const result = await quizzesService.getQuizWithAnswers({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userWhoRequestedId: targetQuiz.userId,
    });

    throw new Error('Should not get Quiz with answers unless submit it');

  }catch(error){
    expect(error).toBeInstanceOf(BadRequestException);
  }

  });

  it("should get Quiz with answers after submit it", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    const result = await quizzesService.getQuizWithAnswers({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userWhoRequestedId: targetQuiz.userId,
    });


    expect(result).toBeDefined();
    expect(result.questions.length).toEqual(targetQuiz.questions.length);
  });


  it("should return users scores", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    const result = (await quizzesService.getUsersScores({
      jobId: targetQuiz.jobId,
      recruiterId: targetQuiz.recruiterId,
      pageOptionsDto: {
        page: 1,
        take: 20,
      }
    })).data;

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBe(quizzes.length);
  });


  it("should throw error when getting users scores with invalid job id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    try {
      await quizzesService.getUsersScores({
        jobId: 'invalid',
        recruiterId: targetQuiz.recruiterId,
        pageOptionsDto: {
          page: 1,
          take: 10,
        }

      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  })


  it("should throw error when getting users scores with invalid recruiter id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    try {
      await quizzesService.getUsersScores({
        jobId: targetQuiz.jobId,
        recruiterId: 'invalid',
        pageOptionsDto: {
          page: 1,
          take: 10,
        }

      });
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });


  it("should throw error when getting users scores with invalid job id and recruiter id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    try {
      await quizzesService.getUsersScores({
        jobId: 'invalid',
        recruiterId: 'invalid',
        pageOptionsDto: {
          page: 1,
          take: 10,
        }
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });



  it("should get user score", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    const result = await quizzesService.getUserQuizzes({
      userId: targetQuiz.userId,
      pageOptionsDto:{
        page: 1,
        take: 10,
      }
    });

    expect(result).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.length).toBe(1);
  });


  it("should return empty array when getting user score with invalid user id", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const targetQuiz = quizzes[1];

    await quizzesService.submitQuiz({
      quizEncodedId: targetQuiz.encodedQuizIdentifier(),
      userAnswers: targetQuiz.questions.map((question, index) => {
        return targetQuiz.questionsAnswers[index];
      }),
      userWhoRequestedId: targetQuiz.userId,
    });

    const result = await quizzesService.getUserQuizzes({
      userId: 'invalid',
      pageOptionsDto:{
        page: 1,
        take: 10,
      }
    });

    expect(result).toBeDefined();
    expect(result.data.length).toBe(0);
  });


  it("should return quizzes slugs", async () => {
    const quizzes = await quizzesService.createQuiz({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
      skills: ['mysql', 'nodejs', 'reactjs', 'typescript', 'mongodb'],
      numberOfQuestions: 5,
      recruiterId: '1',
      deadline: new Date(),
      name: 'Quiz',
      usersDetails: [
        ...Array.from({ length: 27 }, (_, i) => {
          return {
            userId: i.toString(),
            email: 'test' + i + '@test.com',

          };
        })
      ]
    });

    const result = await quizzesService.getQuizSlugs({
      jobId: '109de94e-1a1b-46c0-9371-3162129dcd7e',
    });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBe(quizzes.length);
  });

});
