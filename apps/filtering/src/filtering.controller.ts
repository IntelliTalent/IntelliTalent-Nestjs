import { Controller, Get } from '@nestjs/common';
import { FilteringService } from './filtering.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class FilteringController {
  constructor(private readonly filteringService: FilteringService) {}

  @Get()
  getHello(): string {
    return this.filteringService.getHello();
  }

  @MessagePattern({ cmd: 'filterJob' })
  filterJob(jobId: string) {
    return this.filteringService.filterJob(jobId);
  }

  @MessagePattern({ cmd: 'getAppliedUsers' })
  getAppliedUsers(jobId: string) {
    return this.filteringService.getAppliedUsers(jobId);
  }

  @MessagePattern({ cmd: 'getUserStage' })
  getUserStage(jobId: string, userId: string) {
    return this.filteringService.getUserStage(jobId, userId);
  }

  @MessagePattern({ cmd: 'passQuiz' })
  passQuiz(jobId: string, userId: string) {
    return this.filteringService.passQuiz(jobId, userId);
  }

  @MessagePattern({ cmd: 'failQuiz' })
  failQuiz(jobId: string, userId: string) {
    return this.filteringService.failQuiz(jobId, userId);
  }

  @MessagePattern({ cmd: 'passInterview' })
  passInterview(jobId: string, userId: string) {
    return this.filteringService.passInterview(jobId, userId);
  }

  @MessagePattern({ cmd: 'failInterview' })
  failInterview(jobId: string, userId: string) {
    return this.filteringService.failInterview(jobId, userId);
  }

  
}
