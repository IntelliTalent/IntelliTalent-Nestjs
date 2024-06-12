import { Module } from '@nestjs/common';
import { GithubScrapperService } from './github-scrapper.service';

@Module({
  providers: [GithubScrapperService],
  exports: [GithubScrapperService],
})
export class GithubScrapperModule {}
