import { ApiProperty } from '@nestjs/swagger';
import { ResponseLinkedinProfile } from './response-linkedin-profile.dto';
import { ResponseScrapGithubProfileDto } from './scrap-github-profile.dto';

export class ResponseScrapeProfileDto {
  @ApiProperty({ type: ResponseScrapGithubProfileDto })
  githubUserInfo: ResponseScrapGithubProfileDto;

  @ApiProperty({ type: ResponseLinkedinProfile })
  linkedinUserInfo: ResponseLinkedinProfile;
}
