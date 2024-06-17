import { Controller, Get, UseFilters } from '@nestjs/common';
import { FilteringService } from './filtering.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { JobDto } from '@app/services_communications/filteration-service/dtos/requests/job.dto';
import { PaginatedJobDto } from '@app/services_communications/filteration-service/dtos/requests/paginated-job.dto';
import { AuthQuizDto } from '@app/services_communications/filteration-service/dtos/requests/auth-quiz.dto';
import { AuthInterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-interview-answers.dto';
import { AuthReviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/auth-review-answers.dto';
import { PaginatedMatchedJobDto } from '@app/services_communications/filteration-service/dtos/requests/paginated-matched-job.dto';
import { GetInterviewQuestionsDto } from '@app/services_communications/filteration-service/dtos/requests/get-interview-questions.dto';
import { GetInterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/get-interview-answers.dto';
import { RpcExceptionsFilter } from '@app/shared';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { AuthApplyJobRequestDto } from '@app/services_communications/filteration-service/dtos/requests/auth-appy-job-request.dto';

@Controller()
@UseFilters(RpcExceptionsFilter)
export class FilteringController {
  constructor(private readonly filteringService: FilteringService) { }

  @Get()
  getHello(): string {
    return this.filteringService.getHello();
  }

  @MessagePattern({ cmd: FilterationServicePattern.filterJob })
  applyJob(@Payload() data: AuthApplyJobRequestDto): Promise<StageResponseDto> {
    return this.filteringService.applyJob(data.profileId, data.jobId, data.userId, data.email);
  }

  @MessagePattern({ cmd: FilterationServicePattern.beginCurrentStage })
  beginCurrentStage(@Payload() data: JobDto) {
    return this.filteringService.beginCurrentStage(data.jobId);
  }

  @MessagePattern({ cmd: FilterationServicePattern.getAppliedUsers })
  getAppliedUsers(@Payload() data: PaginatedJobDto):Promise<GetAppliedUsersResponseDto> {
    return this.filteringService.getAppliedUsers(data.userId, data.jobId, data.paginationOptions);
  }

  @MessagePattern({ cmd: FilterationServicePattern.getUserStage })
  getUserStage(@Payload() data:AuthApplyJobRequestDto) {
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
  selectProfile(@Payload() data: AuthApplyJobRequestDto) {
    return this.filteringService.selectProfile(data.userId, data.jobId, data.profileId);
  }

  @MessagePattern({ cmd: FilterationServicePattern.getMatchedJobs })
  getMatchedJobs(@Payload() data: PaginatedMatchedJobDto) {
    return this.filteringService.getMatchedJobs(data.profileId, data.userId, data.paginationOptions);
  }

  @MessagePattern({cmd : FilterationServicePattern.getAppliedJobs})
  getAppliedJobs(@Payload() data: PaginatedMatchedJobDto){
    return this.filteringService.getAppliedJobs(data.userId, data.profileId, data.paginationOptions);
  }

  @MessagePattern({cmd : FilterationServicePattern.getInterviewQuestions})
  getInterveiwQeustions(@Payload() data: GetInterviewQuestionsDto){
    return this.filteringService.getInterviewQuestions(data.userId, data.jobId);
  }

  @MessagePattern({cmd: FilterationServicePattern.getJobApplicants})
  getJobApplicants(@Payload() data: PaginatedJobDto){
    return this.filteringService.getJobApplicants(data.userId, data.jobId,data.isQualified, data.paginationOptions);
  }

  @MessagePattern({cmd: FilterationServicePattern.getInterviewAnswers})
  getInterviewAnswers(@Payload() data: GetInterviewAnswersDto){
    return this.filteringService.getInterviewAnswers(data.userId, data.jobId, data.profileId);
  }

  @MessagePattern({cmd: FilterationServicePattern.getInterviewedApplicants})
  getInterviewedApplicants(@Payload() data: PaginatedJobDto){
    return this.filteringService.getInterviewedApplicants(data.userId, data.jobId, data.paginationOptions);
  }

}
