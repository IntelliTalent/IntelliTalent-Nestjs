import { userServicePatterns } from '@app/services_communications';
import { MATCHING_THRESHOLD, atsServicePattern } from '@app/services_communications/ats-service';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { jobsServicePatterns } from '@app/services_communications/jobs-service';
import { JobType, ServiceName, StructuredJob } from '@app/shared';
import { Filteration, QuizData, StageData } from '@app/shared/entities/filteration.entity';
import { StageType } from '@app/shared/enums/stageType.enum';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FilteringService {

  constructor(
    @Inject(ServiceName.ATS_SERVICE) private readonly atsService: ClientProxy,
    @Inject(ServiceName.JOB_SERVICE) private readonly jobService: ClientProxy,
    @InjectModel('Filteration') private readonly filterationModel: Model<Filteration>,
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async applyJob(profileId: string, jobId: string): Promise<StageResponseDto> {

    // get the job details
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById
        },
        {
          jobId
        },
      ),
    );

    // check if the job exists and is open
    if (!job || !job.isActive) {
      throw new BadRequestException('Job not found or closed');
    }

    // check if user applied to the job before
    const filteration = await this.filterationModel.findOne({ jobId, profileId });
    // create a new filteration
    if (!filteration) {

      // call the  ATS service to match the user with the job to ensure the user passed the match score and custom filters
      const matchingResult: object = await firstValueFrom(
        this.atsService.send(
          {
            cmd: atsServicePattern.matchProfileAndJob,
          },
          {
            profileId,
            jobId,
          },
        ),
      );
      if (matchingResult['status'] != 'matching is done!') {
        throw new BadRequestException(matchingResult['status']);
      }

      const newFilteration = await this.filterationModel.create({
        jobId,
        profileId,
        currentStage: StageType.applied,
        matchData: matchingResult,
        isQualified: !matchingResult['isValid'] || !(matchingResult['matchScore'] > MATCHING_THRESHOLD),
        appliedData: {
          appliedAt: new Date()
        }
      });

      // // check if the job has enabled the quiz stage
      // if ()

      return {
        message: 'User applied to the job',
        stage: StageType.applied,
        stageData: newFilteration.appliedData
      }

    } else if (filteration.currentStage === StageType.matched) {
      // check if the user passed the match score and custom filters
      filteration.currentStage = StageType.applied;
      filteration.appliedData = {
        appliedAt: new Date()
      };

      filteration.isQualified = filteration.matchData.matchScore > MATCHING_THRESHOLD && filteration.matchData.isValid;

      await filteration.save();

      return {
        message: 'User applied to the job',
        stage: StageType.applied,
        stageData: filteration.appliedData
      }

    } else {
      throw new BadRequestException('User already applied to the job');
    }
  }

  async getAppliedUsers(jobId: string, page: number, limit: number): Promise<GetAppliedUsersResponseDto> {
    const results = await this.filterationModel.find({ jobId }).skip((page - 1) * limit).limit(limit).exec();
    const count = await this.filterationModel.countDocuments({ jobId });
    return {
      metadata: {
        count,
        page
      },
      appliedUsers: results.map(result => ({
        userId: result.jobId,
        stage: result.currentStage
      }))
    }
  }

  async getUserStage(jobId: string, userId: string): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }

    let stageData: StageData = null;
    switch (filteration.currentStage) {
      case StageType.matched:
        stageData = filteration.matchData;
        break;
      case StageType.quiz:
        stageData = filteration.quizData;
        break;
      case StageType.interview:
        stageData = filteration.interviewData;
        break;
      case StageType.failed:
        break;
      case StageType.applied:
        stageData = filteration.appliedData;
        break;
      default:
        stageData = filteration.appliedData;
        break;
    }
    return {
      message: 'User stage in the job',
      stage: filteration.currentStage,
      stageData
    }
  }

  async passQuiz(jobId: string, userId: string, grade: number): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, profileId: userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.quiz) {
      throw new BadRequestException('User is not in the quiz stage');
    }
    filteration.quizData = {
      grade,
      quizDate: new Date()
    } as QuizData;
    filteration.currentStage = StageType.interview;
    await filteration.save();
    return {
      message: 'User passed the quiz',
      stage: filteration.currentStage,
      stageData: filteration.quizData
    }
  }

  async failQuiz(jobId: string, userId: string, grade: number): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, profileId: userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.quiz) {
      throw new BadRequestException('User is not in the quiz stage');
    }
    filteration.quizData = {
      grade,
      quizDate: new Date()
    } as QuizData;
    filteration.currentStage = StageType.failed;
    await filteration.save();
    return {
      message: 'User failed the quiz',
      stage: filteration.currentStage,
      stageData: filteration.quizData
    }
  }

  async passInterview(jobId: string, userId: string, answers: string[], grade: number): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, profileId: userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.interview) {
      throw new BadRequestException('User is not in the interview stage');
    }
    filteration.interviewData = {
      answers,
      grade,
      interviewDate: new Date()
    };
    filteration.currentStage = StageType.candidate;
    return {
      message: 'User passed the interview',
      stage: filteration.currentStage,
      stageData: filteration.interviewData
    }
  }

  async failInterview(jobId: string, userId: string, answers: string[], grade: number): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, profileId: userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.interview) {
      throw new BadRequestException('User is not in the interview stage');
    }
    filteration.interviewData = {
      answers,
      grade,
      interviewDate: new Date()
    };
    filteration.currentStage = StageType.failed;
    return {
      message: 'User failed the interview',
      stage: filteration.currentStage,
      stageData: filteration.interviewData
    }
  }

  async selectProfile(jobId: string, userId: string): Promise<StageResponseDto> {
    const filteration = await this.filterationModel.findOne({ jobId, profileId: userId });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.candidate) {
      throw new BadRequestException('User is not in the candidate stage');
    }
    filteration.currentStage = StageType.selected;
    filteration.selectionData = {
      selectedAt: new Date()
    }
    filteration.isClosed = true;
    await this.filterationModel.updateMany({ jobId, profileId: { $ne: userId } }, { currentStage: StageType.failed }).exec();
    await filteration.save();
    return {
      message: 'User selected for the job',
      stage: filteration.currentStage,
      stageData: filteration.selectionData
    }
  }
}
