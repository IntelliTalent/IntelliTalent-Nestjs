import { ApiProperty } from '@nestjs/swagger';

export class ResponseQuizCardDto {
  @ApiProperty({
    type: String,
    description: 'Quiz name',
    example: 'Quiz 0',
  })
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Quiz score',
    example: 54,
  })
  score: number;

  @ApiProperty({
    type: Date,
    description: 'Quiz deadline',
    example: '2024-05-12T20:30:28.931Z',
  })
  deadline: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Quiz is taken',
    example: false,
  })
  isTaken: boolean;

  @ApiProperty({
    type: String,
    description: 'Encoded quiz identifier',
    example:
      'dXNlcklkPWVmNDJkY2Y5LTMwZmItNGZmYi1hNmM3LWNiYjIyMDYzZjIzZSZqb2JJZD0wJnJhbmRvbVNsdWc9NHdvaDhtZmgxazI=',
  })
  encodedQuizIdentifier: string;
}
