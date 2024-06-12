import { Module } from '@nestjs/common';
import { LinkedinScrapperService } from './linkedin-scrapper.service';

@Module({
  imports: [],
  providers: [LinkedinScrapperService],
  exports: [LinkedinScrapperService],
})
export class LinkedinScrapperModule {}
