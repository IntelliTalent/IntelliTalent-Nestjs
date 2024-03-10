import { ApiProperty } from '@nestjs/swagger';

export class ResponseProfileDto {
  @ApiProperty({
    description: 'profile id',
  })
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty({
    isArray: true,
  })
  skills: string[];

  @ApiProperty()
  yearsOfExperience: number;

  @ApiProperty()
  graduatedFromCS: boolean;

  @ApiProperty({
    isArray: true,
  })
  languages: string[];

  @ApiProperty()
  summary: string;

  @ApiProperty()
  cv: string;

  @ApiProperty()
  linkedIn: string;

  @ApiProperty()
  gitHub: string;
}
