import { ApiProperty } from '@nestjs/swagger';

export class ResponseProfileCardsDto {
  @ApiProperty({ example: '1234' })
  id: string;

  @ApiProperty({ example: 'Software Engineer' })
  jobTitle: string;

  @ApiProperty({ example: ['JavaScript', 'TypeScript', 'NestJS'] })
  skills: string[];

  @ApiProperty({ example: 5 })
  yearsOfExperience: number;

  @ApiProperty({
    example:
      'https://drive.google.com/file/d/1ixHUnGWu7D_mbj95JoPvKAhoZxdKKeNk/view?usp=drive_link',
  })
  cv: string;

  @ApiProperty({ example: 'https://www.linkedin.com/in/yousef-elwaer/' })
  linkedIn: string;

  @ApiProperty({ example: 'https://github.com/waer1' })
  gitHub: string;
}
