import { ApiProperty } from '@nestjs/swagger';

export class ResponseSubmitQuiz {
  @ApiProperty({
    description: 'The percentage of you grade in the quiz',
    example: 50,
  })
  percentage: number;
}
