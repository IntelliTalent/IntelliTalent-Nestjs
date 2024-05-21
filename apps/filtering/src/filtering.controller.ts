import { Controller, Get } from '@nestjs/common';
import { FilteringService } from './filtering.service';
import { MessagePattern } from '@nestjs/microservices';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';

@Controller()
export class FilteringController {
  constructor(private readonly filteringService: FilteringService) { }

  @Get()
  getHello(): string {
    return this.filteringService.getHello();
  }

  @MessagePattern({ cmd: 'filterJob' })
  applyJob(data: {profileId: string, jobId: string}): Promise<StageResponseDto> {
    const { profileId, jobId } = data;
    return this.filteringService.applyJob(profileId, jobId);
  }

  @MessagePattern({ cmd: 'getAppliedUsers' })
  getAppliedUsers(jobId: string, page: number, limit: number) {
    return this.filteringService.getAppliedUsers(jobId, page, limit);
  }

  @MessagePattern({ cmd: 'getUserStage' })
  getUserStage(jobId: string, userId: string) {
    return this.filteringService.getUserStage(jobId, userId);
  }

  @MessagePattern({ cmd: 'passQuiz' })
  passQuiz(jobId: string, userId: string, grade: number) {
    return this.filteringService.passQuiz(jobId, userId, grade);
  }

  @MessagePattern({ cmd: 'failQuiz' })
  failQuiz(jobId: string, userId: string, grade: number) {
    return this.filteringService.failQuiz(jobId, userId, grade);
  }

  @MessagePattern({ cmd: 'passInterview' })
  passInterview(jobId: string, userId: string,answers: string[], grade: number) {
    return this.filteringService.passInterview(jobId, userId, answers,grade);
  }

  @MessagePattern({ cmd: 'failInterview' })
  failInterview(jobId: string, userId: string, answers: string[], grade: number) {
    return this.filteringService.failInterview(jobId, userId, answers,grade);
  }

  @MessagePattern({ cmd: 'selectProfile' })
  selectProfile(jobId: string, userId: string) {
    return this.filteringService.selectProfile(jobId, userId);
  }


}
