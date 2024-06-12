import { ApiProperty } from '@nestjs/swagger';

export class ResponseJobQuizzesScore {
  @ApiProperty({
    description: 'The percentage of you grade in the quiz',
    example: 50,
  })
  percentage: number;

  @ApiProperty({
    description: 'The id of the user who submitted the quiz',
    example: '1',
  })
  userId: string;
}
