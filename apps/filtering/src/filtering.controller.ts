import { Controller, Get } from '@nestjs/common';
import { FilteringService } from './filtering.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { JobDto } from '@app/services_communications/filteration-service/dtos/requests/job.dto';
import { ApplyJobRequest } from '@app/services_communications/filteration-service/dtos/requests/apply-job-request.dto';
import { PaginatedJobDto } from '@app/services_communications/filteration-service/dtos/requests/paginated-job.dto';
import { AuthQuizDto } from '@app/services_communications/filteration-service/dtos/requests/auth-quiz.dto';
import { AuthInterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-interview-answers.dto';
import { AuthReviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-review-answers.dto';

@Controller()
export class FilteringController {
  constructor(private readonly filteringService: FilteringService) { }

  @Get()
  getHello(): string {
    return this.filteringService.getHello();
  }

  @MessagePattern({ cmd: FilterationServicePattern.filterJob })
  applyJob(@Payload() data: ApplyJobRequest): Promise<StageResponseDto> {
    return this.filteringService.applyJob(data.profileId, data.jobId, data.userId);
  }

  @MessagePattern({ cmd: FilterationServicePattern.beginCurrentStage })
  beginCurrentStage(@Payload() data: JobDto) {
    return this.filteringService.beginCurrentStage(data.jobId);
  }

  @MessagePattern({ cmd: FilterationServicePattern.getAppliedUsers })
  getAppliedUsers(@Payload() data: PaginatedJobDto) {
    return this.filteringService.getAppliedUsers(data.userId, data.jobId, data.page, data.limit);
  }

  @MessagePattern({ cmd: FilterationServicePattern.getUserStage })
  getUserStage(@Payload() data:ApplyJobRequest) {
    return this.filteringService.getUserStage(data.userId, data.jobId, data.profileId);
  }

  @MessagePattern({ cmd: FilterationServicePattern.passQuiz })
  passQuiz(@Payload() data: AuthQuizDto) {
    return this.filteringService.passQuiz(data.userId, data.jobId, data.profileId, data.grade);
  }

  @MessagePattern({ cmd: FilterationServicePattern.failQuiz })
  failQuiz(@Payload() data: AuthQuizDto) {
    return this.filteringService.failQuiz(data.userId, data.jobId, data.profileId, data.grade);
  }

  @MessagePattern({ cmd: FilterationServicePattern.submitInterview })
  submitInterview(@Payload() interviewAnswers:AuthInterviewAnswersDto) {
    return this.filteringService.submitInterview(interviewAnswers.userId, interviewAnswers.jobId, interviewAnswers.profileId,interviewAnswers);
  }

  @MessagePattern({ cmd: FilterationServicePattern.reviewInterview })
  reviewInterview(@Payload() data: AuthReviewAnswersDto) {
    const {userId, ...answers} = data;
    return this.filteringService.reviewAnswers(userId, answers);
  }

  @MessagePattern({ cmd: FilterationServicePattern.selectProfile })
  selectProfile(@Payload() data: ApplyJobRequest) {
    return this.filteringService.selectProfile(data.userId, data.jobId, data.profileId);
  }


}
