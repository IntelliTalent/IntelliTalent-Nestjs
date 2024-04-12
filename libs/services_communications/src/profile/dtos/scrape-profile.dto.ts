import { IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ScrapeProfile {
  @IsString()
  @ApiPropertyOptional({
    example: 'waer1',
  })
  githubUserName: string;

  @ApiPropertyOptional({
    example: 'yousef-elwaer',
  })
  @IsString()
  linkedinUserName: string;
}
