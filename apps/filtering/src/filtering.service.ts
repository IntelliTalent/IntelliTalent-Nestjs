import {
  MATCHING_THRESHOLD,
  atsServicePattern,
} from '@app/services_communications/ats-service';
import { MatchProfileAndJobData } from '@app/services_communications/ats-service/interfaces/match.interface';
import { GetAppliedUsersResponseDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-users-response.dto';
import { StageResponseDto } from '@app/services_communications/filteration-service/dtos/responses/stage-response.dto';
import { jobsServicePatterns } from '@app/services_communications/jobs-service';
import { ServiceName, StructuredJob, User } from '@app/shared';
import {
  Filteration,
  QuizData,
  StageData,
} from '@app/shared/entities/filteration.entity';
import { StageType } from '@app/shared/enums/stage-type.enum';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as ATS_CONSTANTS from '@app/services_communications/ats-service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/interview-answers.dto';
import { ReviewAnswersDto } from '@app/services_communications/filteration-service/dtos/requests/review-answers.dto';
import * as FILTERATION_CONSTANTS from '@app/services_communications/filteration-service/constants/constants';
import {
  CreateQuizDto,
  EmailTemplates,
  GetQuizSlugsDto,
  InterviewTemplateData,
  NotifierEvents,
  QuizEmailTemplateData,
  SendEmailsDto,
  TemplateData,
  profileServicePattern,
  quizzesEvents,
  quizzesPattern,
  userServicePatterns,
} from '@app/services_communications';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import { StageType as JobStageType } from '@app/shared/entities/structured_jobs.entity';
import { GetUsersByIdsDto } from '@app/services_communications/userService/dtos/get-users.dto';
import { GetMatchedJobsDto } from '@app/services_communications/filteration-service/dtos/responses/get-matched-jobs.dto';
import { GetAppliedJobsDto } from '@app/services_communications/filteration-service/dtos/responses/get-applied-jobs-response.dto';
import { GetInterviewQuestionsResponse } from '@app/services_communications/filteration-service/dtos/responses/get-interview-questions.dto';
import { GetDetailedAppliedUsersDto } from '@app/services_communications/filteration-service/dtos/responses/get-detailed-applied-users.dto';
import { GetInterviewAnswersResponse } from '@app/services_communications/filteration-service/dtos/responses/get-interview-answers-response.dto';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { PageMetaDto } from '@app/shared/api-features/dtos/page-meta.dto';
@Injectable()
export class FilteringService {
  constructor(
    @Inject(ServiceName.ATS_SERVICE) private readonly atsService: ClientProxy,
    @Inject(ServiceName.JOB_SERVICE) private readonly jobService: ClientProxy,
    @Inject(ServiceName.NOTIFIER_SERVICE)
    private readonly notifierService: ClientProxy,
    @Inject(ServiceName.QUIZ_SERVICE) private readonly quizService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private readonly profileService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE) private readonly userService: ClientProxy,
    @InjectRepository(Filteration)
    private readonly filterationRepository: Repository<Filteration>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async applyJob(
    profileId: string,
    jobId: string,
    userId: string,
    email: string,
  ): Promise<StageResponseDto> {
    // get the profile details and ensure that the user is the owner of the profile
    const profile = await firstValueFrom(
      this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      ),
    );
    if (!profile) {
      throw new NotFoundException(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
    }
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER,
      );
    }
    // get the job details
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobDetailsById,
        },
        jobId,
      ),
    );
    // check if the job exists and is open
    if (!job || !job.isActive) {
      throw new BadRequestException(FILTERATION_CONSTANTS.JOB_NOT_FOUND);
    }
    // check if user applied to the job before
    let filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    // create a new filteration
    if (!filteration) {
      // call the  ATS service to match the user with the job to ensure the user passed the match score and custom filters
      const matchingResult: MatchProfileAndJobData = await firstValueFrom(
        this.atsService.send(
          {
            cmd: atsServicePattern.matchProfileAndJob,
          },
          {
            profileId,
            jobId,
          } as ProfileAndJobDto,
        ),
      );
      const { status, ...matchData } = matchingResult;
      if (status != ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS) {
        throw new BadRequestException(status);
      }
      const newFilteration = this.filterationRepository.create({
        jobId,
        profileId,
        userId,
        email,
        currentStage: StageType.applied,
        matchData,
        isQualified:
          matchData.isValid && matchData.matchScore > MATCHING_THRESHOLD,
        appliedData: {
          appliedAt: new Date(),
        },
      });
      filteration = await this.filterationRepository.save(newFilteration);
    } else if (filteration.currentStage === StageType.matched) {
      // check if the user passed the match score and custom filters
      filteration.currentStage = StageType.applied;
      filteration.appliedData = {
        appliedAt: new Date(),
      };
      filteration.isQualified =
        filteration.matchData.matchScore > MATCHING_THRESHOLD &&
        filteration.matchData.isValid;
      await this.filterationRepository.save(filteration);
    } else {
      throw new BadRequestException(FILTERATION_CONSTANTS.USER_ALREADY_APPLIED);
    }

    if (filteration.isQualified) {
      const userDetails: User = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.findUserById,
          },
          userId,
        ),
      );
      // call the quiz service to generate the quiz for the user
      this.quizService.emit(
        {
          cmd: quizzesEvents.createQuiz,
        },
        {
          usersDetails: [
            {
              userId: userId,
              email: userDetails.email,
            },
          ],
          jobId: job.id,
          recruiterId: job.userId,
          name: job.title,
          skills: job.skills,
          numberOfQuestions: FILTERATION_CONSTANTS.NUMBER_OF_QUESTIONS,
          deadline: new Date(job.stages.quizEndDate),
        } as CreateQuizDto,
      );
    }

    return {
      message: FILTERATION_CONSTANTS.USER_APPLIED,
      stage: StageType.applied,
      stageData: filteration.appliedData,
    };
  }

  async beginCurrentStage(jobId: string): Promise<StageResponseDto> {
    // get the job details from the job service
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        jobId,
      ),
    );

    // check if the job exists and is open
    if (!job) {
      throw new BadRequestException(FILTERATION_CONSTANTS.JOB_NOT_FOUND);
    }

    switch (job.currentStage) {
      case JobStageType.Quiz:
        // call the quiz service to get the quiz slugs
        const quizzes: Quiz[] = await firstValueFrom(
          this.quizService.send(
            {
              cmd: quizzesPattern.getQuizSlugs,
            },
            {
              jobId,
            } as GetQuizSlugsDto,
          ),
        );

        const usersIds = quizzes.map((quiz) => quiz.userId);
        // call the mail service to send the mails to the users to start the quiz
        const usersDetails: User[] = await firstValueFrom(
          this.userService.send(
            {
              cmd: userServicePatterns.getUsersByIds,
            },
            {
              usersIds,
            } as GetUsersByIdsDto,
          ),
        );
        // make a map that contains the user id and the user details
        const usersMap = new Map<string, User>();
        usersDetails.forEach((user) => {
          usersMap.set(user.id, user);
        });
        const quizzesTemplateData: TemplateData[] = quizzes.map(
          (quiz: Quiz) => {
            const userDetails = usersMap.get(quiz.userId);
            return {
              to: quiz.email,
              data: {
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                quizSlug: quiz.encodedQuizIdentifier(),
                jobTitle: job.title,
              } as QuizEmailTemplateData,
            };
          },
        );
        const sendEmailsDto: SendEmailsDto = {
          template: EmailTemplates.QUIZ,
          templateData: quizzesTemplateData,
        };

        if (quizzesTemplateData.length > 0) {
          this.notifierService.emit(
            {
              cmd: NotifierEvents.sendEmail,
            },
            sendEmailsDto,
          );
        }
        break;
      case JobStageType.Interview:
        // call the mail service to send the mails to the users to start the interview
        const appliedUsers = await this.filterationRepository.findBy({
          jobId: job.jobId,
          currentStage: StageType.interview,
        });
        const interviewTemplateData: TemplateData[] = await Promise.all(
          appliedUsers.map(async (user) => {
            // get the user details from the user service
            const userDetails: User = await firstValueFrom(
              this.userService.send(
                {
                  cmd: userServicePatterns.findUserById,
                },
                user.userId,
              ),
            );
            return {
              to: user.profileId,
              data: {
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                jobTitle: job.title,
                jobId: job.id,
              } as InterviewTemplateData,
            };
          }),
        );
        const sendInterviewEmailsDto: SendEmailsDto = {
          template: EmailTemplates.INTERVIEW,
          templateData: interviewTemplateData,
        };
        this.notifierService.send(
          {
            cmd: NotifierEvents.sendEmail,
          },
          sendInterviewEmailsDto,
        );
        break;
      default:
        throw new BadRequestException('Not valid stage to begin');
    }
    return {
      message: FILTERATION_CONSTANTS.STAGE_STARTED,
      stage: job.currentStage,
    };
  }

  async getAppliedUsers(
    userId: string,
    jobId: string,
    paginationOptions: PageOptionsDto,
  ): Promise<GetAppliedUsersResponseDto> {
    let { page, take: limit } = paginationOptions;
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }
    page = page || FILTERATION_CONSTANTS.DEFAULT_PAGE;
    limit = limit || FILTERATION_CONSTANTS.DEFAULT_LIMIT;
    page = Math.max(page, FILTERATION_CONSTANTS.MIN_PAGE);
    limit = Math.max(limit, FILTERATION_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, FILTERATION_CONSTANTS.MAX_LIMIT);

    // Step 1: Count the total number of documents matching the jobId
    const totalCount = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.jobId = :jobId', { jobId })
      .getCount();

    // Step 2: Get the applied users with pagination
    const appliedUsers = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.jobId = :jobId', { jobId })
      .skip((page - 1) * limit)
      .take(limit)
      .select(['filteration.profileId', 'filteration.currentStage'])
      .getMany();

    // Step 3: Construct the final result in the desired format
    const results = {
      metadata: new PageMetaDto({
        pageOptionsDto: {
          page,
          take: limit,
        },
        itemCount: totalCount,
      }),
      appliedUsers: appliedUsers.map((user) => ({
        profileId: user.profileId,
        stage: user.currentStage,
      })),
    };
    return results;
  }

  async getUserStage(
    userId: string,
    jobId: string,
    profileId: string,
  ): Promise<StageResponseDto> {
    // check the user is the owner of the profile
    // call the profile service to get the profile details
    const profile = await firstValueFrom(
      this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      ),
    );
    if (!profile) {
      throw new NotFoundException(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
    }
    // check if the user is the owner of the profile
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER,
      );
    }
    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });

    if (!filteration) {
      throw new BadRequestException('User did not apply or matched to the job');
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
      message: FILTERATION_CONSTANTS.CURRENT_STAGE,
      stage: filteration.currentStage,
      stageData,
    };
  }

  async passQuiz(
    userId: string,
    jobId: string,
    profileId: string,
    grade: number,
  ): Promise<StageResponseDto> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobDetailsById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    if (!filteration) {
      throw new BadRequestException(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
    }
    if (filteration.currentStage !== StageType.quiz) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_IN_QUIZ_STAGE,
      );
    }
    filteration.quizData = {
      grade,
      quizDate: new Date(),
    } as QuizData;
    if (job.stages.interview != null) {
      filteration.currentStage = StageType.interview;
    } else {
      filteration.currentStage = StageType.candidate;
    }
    await this.filterationRepository.save(filteration);
    return {
      message: FILTERATION_CONSTANTS.USER_PASSED_QUIZ,
      stage: filteration.currentStage,
      stageData: filteration.quizData,
    };
  }

  async failQuiz(
    userId: string,
    jobId: string,
    profileId: string,
    grade: number,
  ): Promise<StageResponseDto> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId: profileId,
    });
    if (!filteration) {
      throw new BadRequestException(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
    }
    if (filteration.currentStage !== StageType.quiz) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_IN_QUIZ_STAGE,
      );
    }
    filteration.quizData = {
      grade,
      quizDate: new Date(),
    } as QuizData;
    filteration.currentStage = StageType.failed;
    await this.filterationRepository.save(filteration);
    return {
      message: FILTERATION_CONSTANTS.USER_FAILED_QUIZ,
      stage: filteration.currentStage,
      stageData: filteration.quizData,
    };
  }

  async submitInterview(
    userId: string,
    jobId: string,
    profileId: string,
    interview: InterviewAnswersDto,
  ): Promise<StageResponseDto> {
    // call the profile service to get the profile details
    const profile = await firstValueFrom(
      this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      ),
    );
    if (!profile) {
      throw new NotFoundException(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
    }
    // check if the user is the owner of the profile
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER,
      );
    }

    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    if (!filteration) {
      throw new BadRequestException('User did not apply to the job');
    }
    if (filteration.currentStage !== StageType.interview) {
      throw new BadRequestException('User is not in the interview stage');
    }

    filteration.interviewData = {
      answers: interview.answers,
      recordedAnswers: interview.recordedAnswers,
      interviewDate: new Date(),
    };
    await this.filterationRepository.save(filteration);
    return {
      message: FILTERATION_CONSTANTS.USER_SUBMITTED_INTERVIEW,
      stage: filteration.currentStage,
      stageData: filteration.interviewData,
    };
  }

  async reviewAnswers(
    userId: string,
    reviewAnswers: ReviewAnswersDto,
  ): Promise<StageResponseDto> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        reviewAnswers.jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    const { jobId, profileId, grades } = reviewAnswers;
    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    if (!filteration) {
      throw new BadRequestException(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
    }
    if (filteration.currentStage !== StageType.interview) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE,
      );
    }
    if (filteration.interviewData.answers.length !== grades.length) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.ANSWERS_AND_QUESTIONS_NOT_MATCHED,
      );
    }
    const totalGrade = grades.reduce((acc, grade) => acc + grade, 0);
    filteration.interviewData.grade = totalGrade / grades.length;
    filteration.currentStage =
      filteration.interviewData.grade > 50
        ? StageType.candidate
        : StageType.failed;
    await this.filterationRepository.save(filteration);
    return {
      message: FILTERATION_CONSTANTS.RECRUITER_REVIEWED_INTERVIEW,
      stage: filteration.currentStage,
      stageData: filteration.interviewData,
    };
  }

  async selectProfile(
    userId: string,
    jobId: string,
    profileId: string,
  ): Promise<StageResponseDto> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    if (!filteration) {
      throw new BadRequestException(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
    }
    if (filteration.currentStage !== StageType.candidate) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_CANDIDATE,
      );
    }
    filteration.currentStage = StageType.selected;
    filteration.selectionData = {
      selectedAt: new Date(),
    };
    filteration.isClosed = true;

    await this.filterationRepository.save(filteration);
    return {
      message: FILTERATION_CONSTANTS.RECRUITER_SELECTED_CANDIDATE,
      stage: filteration.currentStage,
      stageData: filteration.selectionData,
    };
  }

  async getMatchedJobs(
    profileId: string,
    userId: string,
    paginationOptions: PageOptionsDto,
  ): Promise<GetMatchedJobsDto> {
    let { page, take: limit } = paginationOptions;
    page = page || FILTERATION_CONSTANTS.DEFAULT_PAGE;
    limit = limit || FILTERATION_CONSTANTS.DEFAULT_LIMIT;
    page = Math.max(page, FILTERATION_CONSTANTS.MIN_PAGE);
    limit = Math.max(limit, FILTERATION_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, FILTERATION_CONSTANTS.MAX_LIMIT);

    // ensure the profile is owned by the user
    const profile = await firstValueFrom(
      this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      ),
    );
    if (!profile) {
      throw new NotFoundException(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
    }
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER,
      );
    }

    // Step 1: Count the total number of documents matching the profileId
    const totalCount = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.profileId = :profileId', { profileId })
      .getCount();

    // Step 2: Get the matched jobs with pagination
    const matchedJobs = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where(
        'filteration.profileId = :profileId AND filteration.currentStage = :currentStage',
        { profileId, currentStage: StageType.matched },
      )
      .skip((page - 1) * limit)
      .take(limit)
      .select(['filteration.jobId', 'filteration.matchData'])
      .getMany();

    // Step 3: get the job details for each matched job
    const jobsDetails = await Promise.all(
      matchedJobs.map(async (job) => {
        const jobDetails: StructuredJob = await firstValueFrom(
          this.jobService.send(
            {
              cmd: jobsServicePatterns.getJobById,
            },
            job.jobId,
          ),
        );
        return {
          ...jobDetails,
          matchScore: job.matchData.matchScore,
        };
      }),
    );

    return {
      metadata: new PageMetaDto({
        pageOptionsDto: {
          page,
          take: limit,
        },
        itemCount: totalCount,
      }),
      matchedJobs: jobsDetails,
    };
  }

  async getAppliedJobs(
    userId: string,
    profileId: string,
    paginationOptions: PageOptionsDto,
  ): Promise<GetAppliedJobsDto> {
    let { page, take: limit } = paginationOptions;

    // ensure the profile is owned by the user
    const profile = await firstValueFrom(
      this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      ),
    );
    if (!profile) {
      throw new NotFoundException(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
    }
    if (profile.userId !== userId) {
      throw new UnauthorizedException(
        FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER,
      );
    }

    page = page || FILTERATION_CONSTANTS.DEFAULT_PAGE;
    limit = limit || FILTERATION_CONSTANTS.DEFAULT_LIMIT;
    page = Math.max(page, FILTERATION_CONSTANTS.MIN_PAGE);
    limit = Math.max(limit, FILTERATION_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, FILTERATION_CONSTANTS.MAX_LIMIT);

    // Step 1: Count the total number of documents matching the profileId
    const totalCount = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.profileId = :profileId', { profileId })
      .getCount();

    // Step 2: Get the applied jobs with pagination
    const appliedJobs = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.profileId = :profileId', { profileId })
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'filteration.jobId',
        'filteration.currentStage',
        'filteration.isQualified',
      ])
      .getMany();

    // Step 3: get the job details for each applied job
    const jobsDetails = await Promise.all(
      appliedJobs.map(async (job) => {
        const jobDetails: StructuredJob = await firstValueFrom(
          this.jobService.send(
            {
              cmd: jobsServicePatterns.getJobById,
            },
            job.jobId,
          ),
        );
        return {
          ...jobDetails,
          applicationCurrentStage: job.currentStage,
          isQualified: job.isQualified,
        };
      }),
    );

    return {
      metadata: new PageMetaDto({
        pageOptionsDto: {
          page,
          take: limit,
        },
        itemCount: totalCount,
      }),
      appliedJobs: jobsDetails,
    };
  }

  async getInterviewQuestions(
    userId: string,
    jobId: string,
  ): Promise<GetInterviewQuestionsResponse> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobDetailsById,
        },
        jobId,
      ),
    );
    if (!job.currentStage || job.currentStage !== JobStageType.Interview) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.JOB_NOT_IN_INTERVIEW_STAGE,
      );
    }

    // get the filteration details
    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      userId,
    });
    if (!filteration || filteration.currentStage !== StageType.interview) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE,
      );
    }

    return {
      questions: job.stages.interview.interviewQuestions,
    };
  }

  async getJobApplicants(
    userId: string,
    jobId: string,
    isQualified: boolean,
    paginationOptions: PageOptionsDto,
  ): Promise<GetDetailedAppliedUsersDto> {
    let { page, take: limit } = paginationOptions;
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    page = page || FILTERATION_CONSTANTS.DEFAULT_PAGE;
    limit = limit || FILTERATION_CONSTANTS.DEFAULT_LIMIT;
    page = Math.max(page, FILTERATION_CONSTANTS.MIN_PAGE);
    limit = Math.max(limit, FILTERATION_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, FILTERATION_CONSTANTS.MAX_LIMIT);
    let totalCount = 0;
    let appliedUsers: Filteration[] = [];

    if (isQualified !== null && isQualified !== undefined) {
      totalCount = await this.filterationRepository
        .createQueryBuilder('filteration')
        .where(
          'filteration.jobId = :jobId AND filteration.isQualified = :isQualified',
          { jobId, isQualified },
        )
        .getCount();
      // get the qualified or unqualified users
      appliedUsers = await this.filterationRepository
        .createQueryBuilder('filteration')
        .where(
          'filteration.jobId = :jobId AND filteration.isQualified = :isQualified',
          { jobId, isQualified },
        )
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } else {
      // Step 1: Count the total number of documents matching the jobId
      totalCount = await this.filterationRepository
        .createQueryBuilder('filteration')
        .where('filteration.jobId = :jobId', { jobId })
        .getCount();

      // Step 2: Get the applied users with pagination
      appliedUsers = await this.filterationRepository
        .createQueryBuilder('filteration')
        .where('filteration.jobId = :jobId', { jobId })
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    }

    // Step 3: Construct the final result in the desired format
    const results = {
      metadata: new PageMetaDto({
        pageOptionsDto: {
          page,
          take: limit,
        },
        itemCount: totalCount,
      }),
      appliedUsers,
    };
    return results;
  }

  async getInterviewAnswers(
    userId: string,
    jobId: string,
    profileId: string,
  ): Promise<GetInterviewAnswersResponse> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobDetailsById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    // get the filteration details
    const filteration = await this.filterationRepository.findOneBy({
      jobId,
      profileId,
    });
    if (!filteration || filteration.currentStage !== StageType.interview) {
      throw new BadRequestException(
        FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE,
      );
    }

    return {
      questions: job.stages?.interview?.interviewQuestions,
      answers: filteration.interviewData?.answers,
      recordedAnswers: filteration.interviewData?.recordedAnswers,
    };
  }

  async getInterviewedApplicants(
    userId: string,
    jobId: string,
    paginationOptions: PageOptionsDto,
  ): Promise<GetDetailedAppliedUsersDto> {
    // check if the user is the owner of the job
    const job: StructuredJob = await firstValueFrom(
      this.jobService.send(
        {
          cmd: jobsServicePatterns.getJobDetailsById,
        },
        jobId,
      ),
    );
    if (!job || job.userId !== userId) {
      throw new UnauthorizedException(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
    }

    let { page, take: limit } = paginationOptions;
    page = page || FILTERATION_CONSTANTS.DEFAULT_PAGE;
    limit = limit || FILTERATION_CONSTANTS.DEFAULT_LIMIT;
    page = Math.max(page, FILTERATION_CONSTANTS.MIN_PAGE);
    limit = Math.max(limit, FILTERATION_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, FILTERATION_CONSTANTS.MAX_LIMIT);

    // Get the applicants who took the interview and have not received a grade yet
    const interviewedApplicants = await this.filterationRepository
      .createQueryBuilder('filteration')
      .where('filteration.jobId = :jobId', { jobId })
      .andWhere('filteration.interviewData IS NOT NULL')
      .andWhere("filteration.interviewData ->> 'interviewDate' IS NOT NULL")
      .andWhere("filteration.interviewData ->> 'grade' IS NULL")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      metadata: new PageMetaDto({
        pageOptionsDto: {
          page,
          take: limit,
        },
        itemCount: interviewedApplicants.length,
      }),
      appliedUsers: interviewedApplicants,
    };
  }
}
