import { Injectable } from '@nestjs/common';

@Injectable()
export class FilteringService {
  getHello(): string {
    return 'Hello World!';
  }

  filterJob(jobId: string) {
    return {
      message: 'job filtered successfully',
    };
  }

  getAppliedUsers(jobId: string) {
    return {
      metadata:{
        count: 10,
        page: 1
      },
      appliedUsers: [
        {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          stage: 'Interview'
        },
        {
          userId: '123e4567-e89b-12d3-a456-426614174001',
          stage: 'Applied'
        }
      ]
    };
  }

  getUserStage(jobId: string, userId: string) {
    return {
      stage: 'Interview'
    };
  }

  passQuiz(jobId: string, userId: string) {
    return {
      message: 'user passed the quiz'
    };
  }

  failQuiz(jobId: string, userId: string) {
    return {
      message: 'user failed the quiz'
    };
  }

  passInterview(jobId: string, userId: string) {
    return {
      message: 'user passed the interview'
    };
  }

  failInterview(jobId: string, userId: string) {
    return {
      message: 'user failed the interview'
    };
  }
}
