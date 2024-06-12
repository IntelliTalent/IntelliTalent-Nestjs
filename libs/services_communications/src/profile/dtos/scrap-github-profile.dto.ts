import { ApiProperty } from '@nestjs/swagger';

export class ResponseScrapGithubProfileDto {
  @ApiProperty({
    example: 'https://avatars.githubusercontent.com/u/70758177?v=4',
  })
  avatar_url: string;

  @ApiProperty({ example: 'https://github.com/Waer1' })
  html_url: string;

  @ApiProperty({ example: 'https://api.github.com/users/Waer1/repos' })
  repos_url: string;

  @ApiProperty({ example: 'Yousef Alwaer' })
  name: string;

  @ApiProperty({ example: 'GitHub' })
  company: string;

  @ApiProperty({ example: 'https://www.linkedin.com/in/yousef-elwaer/' })
  blog: string;

  @ApiProperty({ example: 'Cairo' })
  location: string;

  @ApiProperty({ example: 'octocat@github.com' })
  email: string;

  @ApiProperty({
    example:
      'DevOps Engineer | Full Stack Developer | Transforming ideas into real scalable solutions.',
  })
  bio: string;

  @ApiProperty({ example: 2 })
  public_repos: number;

  @ApiProperty({ example: 20 })
  followers: number;

  @ApiProperty({ example: 0 })
  following: number;

  @ApiProperty({ example: '2020-09-04T12:16:18Z' })
  created_at: string;
}
