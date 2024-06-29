import { ApiProperty } from '@nestjs/swagger';

export class GetUserInterviewStatsResDto {
  @ApiProperty({ type: Number, description: 'Total number of interviews' })
  total: number;

  @ApiProperty({ type: Number, description: 'Number of interviews taken' })
  taken: number;

  @ApiProperty({ type: Number, description: 'Number of interviews not taken' })
  notTaken: number;
}
