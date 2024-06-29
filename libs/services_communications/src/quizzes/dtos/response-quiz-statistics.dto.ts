import { ApiProperty } from '@nestjs/swagger';

export class ResponseQuizStatisticsDto {
  @ApiProperty({ type: Number, description: 'Total number of questions' })
  total: number;

  @ApiProperty({ type: Number, description: 'Number of quizzes taken' })
  taken: number;

  @ApiProperty({ type: Number, description: 'Number of quizzes not taken' })
  notTaken: number;
}
