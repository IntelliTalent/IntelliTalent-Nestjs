import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ScrapeProfile {
  @IsString()
  @ApiPropertyOptional({
    example: 'waer1',
  })
  @IsOptional()
  githubUserName?: string;

  @ApiPropertyOptional({
    example: 'yousef-elwaer',
  })
  @IsString()
  @IsOptional()
  linkedinUserName?: string;
}
