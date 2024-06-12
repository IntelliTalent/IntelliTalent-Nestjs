('');
import { Question } from '@app/shared/entities/quiz.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseQuizWithoutAnswersDto {
  @ApiProperty({
    description: 'identify the quiz',
    example: [
      {
        answers: [
          'a) They capture expert design knowledge',
          'b) They make captured design accessible to both novices and other experts',
          'c) All of the mentioned',
          'd) None of the mentioned',
        ],
        question: 'Why are Patterns important?',
      },
    ],
  })
  questions: Question[];

  @ApiProperty({
    type: String,
    description: 'identify that this quis has been taken or not',
    example: true,
  })
  isTaken: boolean;
}

export class ResponseQuizWithAnswersDto {
  @ApiProperty({
    description: 'identify the quiz',
    example: [
      {
        answers: [
          'a) They capture expert design knowledge',
          'b) They make captured design accessible to both novices and other experts',
          'c) All of the mentioned',
          'd) None of the mentioned',
        ],
        question: 'Why are Patterns important?',
      },
    ],
  })
  questions: Question[];

  @ApiProperty({
    type: Number,
    isArray: true,
    example: [2, 1, 3, 0],
    description: 'index of the correct answer in the answers array',
  })
  questionsAnswers: number[];

  @ApiProperty({
    type: Number,
    isArray: true,
    example: [2, 1, 3, 0],
    description: 'index of the user answer in the answers array',
  })
  userAnswers: number[];

  @ApiProperty({
    type: Number,
    example: 50,
    description: 'The score of the user',
  })
  score: number;
}
