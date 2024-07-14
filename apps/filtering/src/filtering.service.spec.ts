import { Test, TestingModule } from "@nestjs/testing";
import { FilteringService } from "./filtering.service";
import { of } from "rxjs";
import { Filteration, InterviewData, Profile, ServiceName, SharedModule, StructuredJob } from "@app/shared";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as ATS_CONSTANTS from '@app/services_communications/ats-service';
import { MatchProfileAndJobData } from "@app/services_communications/ats-service/interfaces/match.interface";
import * as FILTERATION_CONSTANTS from '@app/services_communications/filteration-service/constants/constants';
import { StageType } from "@app/shared/enums/stage-type.enum";
import { v4 as uuidv4 } from 'uuid';
import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";
import { InterviewAnswersDto } from "@app/services_communications/filteration-service/dtos/requests/interview-answers.dto";
import { ReviewAnswersDto } from "@app/services_communications/filteration-service/dtos/requests/review-answers.dto";
import { StageType as JobStageType } from '@app/shared/entities/structured_jobs.entity';


describe('Filtering service test', () => {
  let filteringService: FilteringService;
  let mockAtsService: any;
  let mockUserService: any;
  let mockProfileService: any;
  let mockJobService: any;
  let mockNotifierService: any;
  let mockQuizService: any;

  beforeAll(async () => {
    mockAtsService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockUserService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockProfileService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockJobService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockNotifierService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockQuizService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Filteration],
          true
        ),
        TypeOrmModule.forFeature([Filteration]),
      ],
      providers: [
        FilteringService,
        {
          provide: ServiceName.ATS_SERVICE,
          useValue: mockAtsService,
        },
        {
          provide: ServiceName.USER_SERVICE,
          useValue: mockUserService,
        },
        {
          provide: ServiceName.PROFILE_SERVICE,
          useValue: mockProfileService,
        },
        {
          provide: ServiceName.JOB_SERVICE,
          useValue: mockJobService,
        },
        {
          provide: ServiceName.NOTIFIER_SERVICE,
          useValue: mockNotifierService,
        },
        {
          provide: ServiceName.QUIZ_SERVICE,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    filteringService = module.get<FilteringService>(FilteringService);
  });

  beforeEach(async () => {
    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.delete({});
  });

  it('should be defined', () => {
    expect(filteringService).toBeDefined();
  });

  it('apply for job for the first time', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email = 'johndoe@gmail.com';
    const job = {
      id: jobId,
      isActive: true,
      stages: {
        quizEndDate: new Date(),
      }
    } as StructuredJob;
    const atsResult: MatchProfileAndJobData = {
      status: ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS,
      matchScore: 0.8,
      isValid: true,
    }

    mockProfileService.send.mockImplementation(() => of(profile));
    mockQuizService.emit.mockImplementation(() => of({}));
    mockJobService.send.mockImplementation(() => of(job));
    mockAtsService.send.mockImplementation(() => of(atsResult));

    const result = await filteringService.applyJob(
      profile.id,
      jobId,
      userId,
      email
    );

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(StageType.applied);
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(FILTERATION_CONSTANTS.USER_APPLIED);
    expect(result).toHaveProperty('stageData');
  });

  it('apply for invalid jobId, should throw not found exception', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email = 'mohamed@gmail.com';
    mockJobService.send.mockImplementation(() => of(null));
    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.applyJob(profile.id, jobId, userId, email)).rejects.toThrow(FILTERATION_CONSTANTS.JOB_NOT_FOUND);
  });


  it('apply with invalid profileId, should throw not found exception', async () => {
    const jobId = uuidv4();
    const userId = uuidv4();
    const email = 'mohamed@gmail.com';
    mockProfileService.send.mockImplementation(() => of(null));
    expect(filteringService.applyJob(uuidv4(), jobId, userId, email)).rejects.toThrow(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
  });

  it('apply with user not owner of the profile, should throw exception', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = uuidv4();
    const email = 'mohamed@gmail.com';
    mockProfileService.send.mockImplementation(() => of(profile));
    expect(filteringService.applyJob(profile.id, jobId, userId, email)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER);
  });

  it('apply for job that is not active, should throw exception', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email = 'mohamed@gmail.com';
    const job = {
      id: jobId,
      isActive: false,
    } as StructuredJob;
    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(() => of(job));
    expect(filteringService.applyJob(profile.id, jobId, userId, email)).rejects.toThrow(FILTERATION_CONSTANTS.JOB_NOT_FOUND);
  });

  it('apply for a job for second time', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email = 'johndoe@gmail.com';
    const job = {
      id: jobId,
      isActive: true,
      stages: {
        quizEndDate: new Date(),
      }
    } as StructuredJob;

    mockProfileService.send.mockImplementation(() => of(profile));
    mockQuizService.emit.mockImplementation(() => of({}));
    mockJobService.send.mockImplementation(() => of(job));

    await filteringService.applyJob(profile.id, jobId, userId, email);
    expect(filteringService.applyJob(profile.id, jobId, userId, email)).rejects.toThrow(FILTERATION_CONSTANTS.USER_ALREADY_APPLIED);
  });

  it('apply with low ATS matching score, should not qualify', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email = 'test@example.com';
    const job = {
      id: jobId,
      isActive: true,
      stages: {
        quizEndDate: new Date(),
      }
    } as StructuredJob;

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(() => of(job));
    mockAtsService.send.mockImplementation(() => of({
      status: ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS,
      matchScore: 0.4,  // Below threshold
      isValid: true,
    }));

    const result = await filteringService.applyJob(profile.id, jobId, userId, email);
    const filteration = await filteringService._getFilteration(profile.id, jobId);
    expect(filteration.isQualified).toBe(false);
    expect(result).toBeDefined();
    expect(result.stage).toBe(StageType.applied);
    expect(result).toHaveProperty('stageData');
  });

  it('apply for job with different emails', async () => {
    const profile = {
      id: uuidv4(),
      userId: uuidv4(),
    } as Profile;
    const jobId = uuidv4();
    const userId = profile.userId;
    const email1 = 'test1@example.com';
    const email2 = 'test2@example.com';
    const job = {
      id: jobId,
      isActive: true,
      stages: {
        quizEndDate: new Date(),
      }
    } as StructuredJob;

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(() => of(job));
    mockAtsService.send.mockImplementation(() => of({
      status: ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS,
      matchScore: 0.8,
      isValid: true,
    }));

    await filteringService.applyJob(profile.id, jobId, userId, email1);

    expect(filteringService.applyJob(profile.id, jobId, userId, email2)).rejects.toThrow(FILTERATION_CONSTANTS.USER_ALREADY_APPLIED);
  });

  it('should get applied users with pagination', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const job = {
      id: jobId,
      userId,
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    // Insert sample filteration data into the testing database
    const filterationRepository = filteringService['filterationRepository'];

    const filterations: Filteration[] = [];

    for (let i = 0; i < 3; i++) {
      filterations.push(new Filteration());
      filterations[i].jobId = jobId;
      filterations[i].profileId = uuidv4();
      filterations[i].userId = userId;
      filterations[i].email = 'test@gmail.com';
      filterations[i].currentStage = StageType.applied;
    }

    await filterationRepository.save(filterations);


    const result = await filteringService.getAppliedUsers(userId, jobId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(3);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(3);
    expect(result.appliedUsers[0]).toHaveProperty('profileId');
    expect(result.appliedUsers[0]).toHaveProperty('stage');
    expect(result.appliedUsers[0].stage).toBe('applied');

  });

  it('should handle default pagination values', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {} as PageOptionsDto; // No pagination options provided

    const job = {
      id: jobId,
      userId,
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));
    // Insert sample filteration data into the testing database
    const filterationRepository = filteringService['filterationRepository'];

    const filterations: Filteration[] = [];

    for (let i = 0; i < 3; i++) {
      filterations.push(new Filteration());
      filterations[i].jobId = jobId;
      filterations[i].profileId = uuidv4();
      filterations[i].userId = userId;
      filterations[i].email = 'test@gmail.com';
      filterations[i].currentStage = StageType.applied;
    }

    await filterationRepository.save(filterations);

    const result = await filteringService.getAppliedUsers(userId, jobId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(FILTERATION_CONSTANTS.DEFAULT_PAGE);
    expect(result.metadata.take).toBe(FILTERATION_CONSTANTS.DEFAULT_LIMIT);
    expect(result.metadata.itemCount).toBe(3);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(3);
    expect(result.appliedUsers[0]).toHaveProperty('profileId');
    expect(result.appliedUsers[0]).toHaveProperty('stage');
    expect(result.appliedUsers[0].stage).toBe('applied');

  });

  // Tests for getUserStage
  it('should get user stage', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.applied;
    filteration.appliedData = { appliedAt: new Date() };

    const filterationRepository = filteringService['filterationRepository'];

    await filterationRepository.save(filteration);

    mockProfileService.send.mockImplementation(() => of(profile));

    const result = await filteringService.getUserStage(userId, jobId, profileId);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(StageType.applied);
    expect(result).toHaveProperty('stageData');
    expect(result.stageData).toHaveProperty('appliedAt');
  });

  it('get user stage with invalid profileId, should throw not found exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    mockProfileService.send.mockImplementation(() => of(null));

    await expect(filteringService.getUserStage(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
  });

  it('get user stage with user not owner of the profile, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const profile = {
      id: profileId,
      userId: uuidv4(), // Different userId
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.getUserStage(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER);
  });

  it('get user stage with no filteration, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.getUserStage(userId, jobId, profileId)).rejects.toThrow('User did not apply or matched to the job');
  });

  // Tests for submitInterview
  it('should submit interview and update stage data', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const interviewAnswers = {
      answers: ['answer1', 'answer2'],
      recordedAnswers: ['recording1', 'recording2'],
    } as InterviewAnswersDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.interview;

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockProfileService.send.mockImplementation(() => of(profile));

    const result = await filteringService.submitInterview(userId, jobId, profileId, interviewAnswers);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(StageType.interview);
    expect(result).toHaveProperty('stageData');
    expect(result.stageData).toHaveProperty('answers');
    expect((result.stageData as InterviewData).answers).toEqual(interviewAnswers.answers);
    expect(result.stageData).toHaveProperty('recordedAnswers');
    expect((result.stageData as InterviewData).recordedAnswers).toEqual(interviewAnswers.recordedAnswers);
    expect(result.message).toBe(FILTERATION_CONSTANTS.USER_SUBMITTED_INTERVIEW);
  });

  it('submit interview with user not owner of the profile, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const interviewAnswers = {
      answers: ['answer1', 'answer2'],
      recordedAnswers: ['recording1', 'recording2'],
    } as InterviewAnswersDto;

    const profile = {
      id: profileId,
      userId: uuidv4(), // Different userId
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.submitInterview(userId, jobId, profileId, interviewAnswers)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER);
  });

  it('submit interview with user did not apply, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const interviewAnswers = {
      answers: ['answer1', 'answer2'],
      recordedAnswers: ['recording1', 'recording2'],
    } as InterviewAnswersDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.submitInterview(userId, jobId, profileId, interviewAnswers)).rejects.toThrow('User did not apply to the job');
  });

  it('submit interview with user not in interview stage, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const interviewAnswers = {
      answers: ['answer1', 'answer2'],
      recordedAnswers: ['recording1', 'recording2'],
    } as InterviewAnswersDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.applied;  // Not in interview stage

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.submitInterview(userId, jobId, profileId, interviewAnswers)).rejects.toThrow('User is not in the interview stage');
  });

  // Tests for reviewAnswers
  it('should review answers and update interview data', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const reviewAnswersDto = {
      jobId: jobId,
      profileId: profileId,
      grades: [4, 5],
    } as ReviewAnswersDto;

    const job = {
      id: jobId,
      userId: userId,
      stages: {
        interview: {
          id: uuidv4(),
          interviewQuestions: ['What is your name?'],
          endDate: new Date(),
        },  // Job has an interview stage
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.interview;
    filteration.interviewData = {
      answers: ['answer1', 'answer2'],
      recordedAnswers: ['recording1', 'recording2'],
      interviewDate: new Date(),
      jobTitle: 'Software Engineer',
      deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    };

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.reviewAnswers(userId, reviewAnswersDto);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(StageType.interview);
    expect(result).toHaveProperty('stageData');
    expect(result.stageData).toHaveProperty('grade');
    expect((result.stageData as InterviewData).grade).toBe((4 + 5) / 2);
    expect(result.message).toBe(FILTERATION_CONSTANTS.RECRUITER_REVIEWED_INTERVIEW);
  });

  it('review answers with user not owner of the job, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const reviewAnswersDto = {
      jobId: jobId,
      profileId: profileId,
      grades: [4, 5],
    } as ReviewAnswersDto;

    const job = {
      id: jobId,
      userId: uuidv4(), // Different userId
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.reviewAnswers(userId, reviewAnswersDto)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
  });

  it('review answers with user did not apply, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const reviewAnswersDto = {
      jobId: jobId,
      profileId: profileId,
      grades: [4, 5],
    } as ReviewAnswersDto;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.reviewAnswers(userId, reviewAnswersDto)).rejects.toThrow(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
  });

  it('review answers with user not in interview stage, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const reviewAnswersDto = {
      jobId: jobId,
      profileId: profileId,
      grades: [4, 5],
    } as ReviewAnswersDto;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.applied; // Not in interview stage

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.reviewAnswers(userId, reviewAnswersDto)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE);
  });

  it('review answers with unmatched answers and grades, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const reviewAnswersDto = {
      jobId: jobId,
      profileId: profileId,
      grades: [4], // Only one grade provided
    } as ReviewAnswersDto;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.interview;
    filteration.interviewData = {
      answers: ['answer1', 'answer2'], // Two answers expected
      recordedAnswers: ['recording1', 'recording2'],
      interviewDate: new Date(),
      jobTitle: 'Software Engineer',
      deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    };

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.reviewAnswers(userId, reviewAnswersDto)).rejects.toThrow(FILTERATION_CONSTANTS.ANSWERS_AND_QUESTIONS_NOT_MATCHED);
  });

  // Tests for selectProfile
  it('should select profile and update stage data', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      stages: {
        interview: {
          id: uuidv4(),
          interviewQuestions: ['What is your name?'],
          endDate: new Date(),
        },  // Job has an interview stage
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.candidate;

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.selectProfile(userId, jobId, profileId);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(StageType.selected);
    expect(result).toHaveProperty('stageData');
    expect(result.stageData).toHaveProperty('selectedAt');
    expect(result.message).toBe(FILTERATION_CONSTANTS.RECRUITER_SELECTED_CANDIDATE);
  });

  it('select profile with user not owner of the job, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: uuidv4(), // Different userId
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.selectProfile(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
  });

  it('select profile with user did not apply, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.selectProfile(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_DID_NOT_APPLY);
  });

  it('select profile with user not in candidate stage, should throw exception', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@gmail.com';
    filteration.currentStage = StageType.interview; // Not in candidate stage

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.selectProfile(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_CANDIDATE);
  });

  // Tests for getMatchedJobs
  it('should get matched jobs with pagination', async () => {
    const profileId = uuidv4();
    const userId = uuidv4();
    const ownerId = uuidv4();
    const email = 'test@example.com'
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const jobIds = [uuidv4(), uuidv4(), uuidv4()];
    const filterations = jobIds.map((jobId) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = profileId;
      filteration.userId = userId;
      filteration.email = email;
      filteration.currentStage = StageType.matched;
      filteration.matchData = {
        matchScore: Math.random() * 100,
        isValid: true
      };
      return filteration;
    });

    const jobs = jobIds.map((jobId) => ({
      userId: ownerId,
      id: jobId,
      isActive: true,
      title: `Job ${jobId}`,
      stages: {
        quizEndDate: new Date(),
      }
    } as StructuredJob));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(({ cmd }, { jobId }) => {
      const job = jobs.find((j) => j.id === jobId);
      return of(job);
    });

    const result = await filteringService.getMatchedJobs(profileId, userId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(jobIds.length);
    expect(result).toHaveProperty('matchedJobs');
    expect(result.matchedJobs).toHaveLength(jobIds.length);
    result.matchedJobs.forEach((job, index) => {
      expect(job).toHaveProperty('id', jobs[index].id);
      expect(job).toHaveProperty('title', jobs[index].title);
    });
  });

  it('get matched jobs with user not owner of the profile, should throw exception', async () => {
    const profileId = uuidv4();
    const userId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: uuidv4(), // Different userId
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.getMatchedJobs(profileId, userId, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER);
  });

  it('get matched jobs with invalid profileId, should throw not found exception', async () => {
    const profileId = uuidv4();
    const userId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    mockProfileService.send.mockImplementation(() => of(null));

    await expect(filteringService.getMatchedJobs(profileId, userId, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
  });

  // Tests for getAppliedJobs
  it('should get applied jobs with pagination', async () => {
    const userId = uuidv4();
    const profileId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const jobIds = [uuidv4(), uuidv4(), uuidv4()];
    const filterations = jobIds.map((jobId) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = profileId;
      filteration.email = 'test@example.com',
        filteration.userId = userId;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = Math.random() > 0.5;
      return filteration;
    });

    const jobs = jobIds.map((jobId) => ({
      id: jobId,
      title: `Job ${jobId}`,
      description: `Description for job ${jobId}`,
    } as StructuredJob));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(({ cmd }, { jobId }) => {
      const job = jobs.find((j) => j.id === jobId);
      return of(job);
    });

    const result = await filteringService.getAppliedJobs(userId, profileId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(jobIds.length);
    expect(result).toHaveProperty('appliedJobs');
    expect(result.appliedJobs).toHaveLength(jobIds.length);
    result.appliedJobs.forEach((job, index) => {
      expect(job).toHaveProperty('id', jobs[index].id);
      expect(job).toHaveProperty('title', jobs[index].title);
      expect(job).toHaveProperty('description', jobs[index].description);
      expect(job).toHaveProperty('applicationCurrentStage', filterations[index].currentStage);
      expect(job).toHaveProperty('isQualified', filterations[index].isQualified);
    });
  });

  it('get applied jobs with user not owner of the profile, should throw exception', async () => {
    const profileId = uuidv4();
    const userId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: uuidv4(), // Different userId
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));

    await expect(filteringService.getAppliedJobs(userId, profileId, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_PROFILE_OWNER);
  });

  it('get applied jobs with invalid profileId, should throw not found exception', async () => {
    const profileId = uuidv4();
    const userId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    mockProfileService.send.mockImplementation(() => of(null));

    await expect(filteringService.getAppliedJobs(userId, profileId, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.PROFILE_NOT_FOUND);
  });

  it('should handle pagination correctly', async () => {
    const userId = uuidv4();
    const profileId = uuidv4();
    const paginationOptions = {
      page: 2,
      take: 2,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    const jobIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const filterations = jobIds.map((jobId, index) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = profileId;
      filteration.email = 'test@example.com',
        filteration.userId = userId;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = index % 2 === 0; // Alternate qualified status
      return filteration;
    });

    const jobs = jobIds.map((jobId) => ({
      id: jobId,
      title: `Job ${jobId}`,
      description: `Description for job ${jobId}`,
    } as StructuredJob));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(({ cmd }, jobId) => {
      const job = jobs.find((j) => j.id === jobId);
      return of(job);
    });

    const result = await filteringService.getAppliedJobs(userId, profileId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(2);
    expect(result.metadata.take).toBe(2);
    expect(result.metadata.itemCount).toBe(jobIds.length);
    expect(result).toHaveProperty('appliedJobs');
    expect(result.appliedJobs).toHaveLength(2); // Should return 2 jobs in page 2
  });

  it('should return an empty list if there are no applied jobs', async () => {
    const userId = uuidv4();
    const profileId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const profile = {
      id: profileId,
      userId: userId,
    } as Profile;

    mockProfileService.send.mockImplementation(() => of(profile));
    mockJobService.send.mockImplementation(() => of(null));

    const result = await filteringService.getAppliedJobs(userId, profileId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(0);
    expect(result).toHaveProperty('appliedJobs');
    expect(result.appliedJobs).toHaveLength(0);
  });

  // Tests for getInterviewQuestions
  it('should get interview questions successfully', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      currentStage: JobStageType.Interview,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.userId = userId;
    filteration.email = 'test@example.com';
    filteration.profileId = uuidv4();
    filteration.currentStage = StageType.interview;

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getInterviewQuestions(userId, jobId);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('questions');
    expect(result.questions).toEqual(['What is your name?', 'Why do you want this job?']);
  });

  it('should throw exception if job is not in interview stage', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      currentStage: JobStageType.Final, // Not in interview stage
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewQuestions(userId, jobId)).rejects.toThrow(FILTERATION_CONSTANTS.JOB_NOT_IN_INTERVIEW_STAGE);
  });

  it('should throw exception if user is not in interview stage', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      currentStage: JobStageType.Interview,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.userId = userId;
    filteration.email = 'test@example.com';
    filteration.profileId = uuidv4();
    filteration.currentStage = StageType.applied; // Not in interview stage

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewQuestions(userId, jobId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE);
  });

  it('should throw exception if filteration details not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      currentStage: JobStageType.Interview,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewQuestions(userId, jobId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE);
  });

  it('should throw exception if job details not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();

    mockJobService.send.mockImplementation(() => of(null));

    await expect(filteringService.getInterviewQuestions(userId, jobId)).rejects.toThrow();
  });

  // Tests for getJobApplicants
  it('should get job applicants with pagination', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;
    const isQualified = null;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 15 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = i % 2 === 0;
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(15);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(10);
  });

  it('should throw exception if user is not the owner of the job', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;
    const isQualified = null;

    const job = {
      id: jobId,
      userId: uuidv4(), // Different userId
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
  });

  it('should throw exception if job is not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;
    const isQualified = null;

    mockJobService.send.mockImplementation(() => of(null));

    await expect(filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions)).rejects.toThrow();
  });

  it('should get only qualified applicants', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;
    const isQualified = true;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 10 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = i % 2 === 0;
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(5); // Only 5 qualified applicants
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(5);
    result.appliedUsers.forEach((applicant) => {
      expect(applicant.isQualified).toBe(true);
    });
  });

  it('should get only unqualified applicants', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;
    const isQualified = false;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 10 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = i % 2 === 0;
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(5); // Only 5 unqualified applicants
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(5);
    result.appliedUsers.forEach((applicant) => {
      expect(applicant.isQualified).toBe(false);
    });
  });

  it('should handle pagination correctly', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 2,
      take: 5,
    } as PageOptionsDto;
    const isQualified = null;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 15 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.applied;
      filteration.isQualified = Math.random() > 0.5;
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getJobApplicants(userId, jobId, isQualified, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(2);
    expect(result.metadata.take).toBe(5);
    expect(result.metadata.itemCount).toBe(15);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(5); // Should return 5 jobs in page 2
  });

  // Tests for getInterviewAnswers
  it('should get interview answers successfully', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@example.com'
    filteration.currentStage = StageType.interview;
    filteration.interviewData = {
      answers: ['John Doe', 'Because I am passionate about this field'],
      recordedAnswers: ['recording1', 'recording2'],
      interviewDate: new Date(),
      jobTitle: 'Software Engineer',
      deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    };

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getInterviewAnswers(userId, jobId, profileId);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('questions');
    expect(result.questions).toEqual(['What is your name?', 'Why do you want this job?']);
    expect(result).toHaveProperty('answers');
    expect(result.answers).toEqual(['John Doe', 'Because I am passionate about this field']);
    expect(result).toHaveProperty('recordedAnswers');
    expect(result.recordedAnswers).toEqual(['recording1', 'recording2']);
  });

  it('should throw exception if user is not the owner of the job', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: uuidv4(), // Different userId
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewAnswers(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
  });

  it('should throw exception if job is not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    mockJobService.send.mockImplementation(() => of(null));

    await expect(filteringService.getInterviewAnswers(userId, jobId, profileId)).rejects.toThrow();
  });

  it('should throw exception if user is not in interview stage', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    const filteration = new Filteration();
    filteration.jobId = jobId;
    filteration.profileId = profileId;
    filteration.userId = userId;
    filteration.email = 'test@example.com'
    filteration.currentStage = StageType.applied; // Not in interview stage

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filteration);

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewAnswers(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE);
  });

  it('should throw exception if filteration details not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const profileId = uuidv4();

    const job = {
      id: jobId,
      userId: userId,
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewAnswers(userId, jobId, profileId)).rejects.toThrow(FILTERATION_CONSTANTS.USER_IS_NOT_IN_INTERVIEW_STAGE);
  });

  // Tests for getInterviewedApplicants
  it('should get interviewed applicants with pagination', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 15 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.interview;
      filteration.interviewData = {
        interviewDate: new Date(),
        answers: [`Answer ${i}`],
        recordedAnswers: [`Recording ${i}`],
        jobTitle: 'Software Engineer',
        deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      };
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getInterviewedApplicants(userId, jobId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(1);
    expect(result.metadata.take).toBe(10);
    expect(result.metadata.itemCount).toBe(15);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(10); // Should return 10 applicants in page 1
  });

  it('should throw exception if user is not the owner of the job', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    const job = {
      id: jobId,
      userId: uuidv4(), // Different userId
    } as StructuredJob;

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.getInterviewedApplicants(userId, jobId, paginationOptions)).rejects.toThrow(FILTERATION_CONSTANTS.USER_NOT_JOB_OWNER);
  });

  it('should throw exception if job is not found', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 1,
      take: 10,
    } as PageOptionsDto;

    mockJobService.send.mockImplementation(() => of(null));

    await expect(filteringService.getInterviewedApplicants(userId, jobId, paginationOptions)).rejects.toThrow();
  });

  it('should handle pagination correctly', async () => {
    const userId = uuidv4();
    const jobId = uuidv4();
    const paginationOptions = {
      page: 2,
      take: 5,
    } as PageOptionsDto;

    const job = {
      id: jobId,
      userId: userId,
    } as StructuredJob;

    const filterations = Array.from({ length: 15 }, (_, i) => {
      const filteration = new Filteration();
      filteration.jobId = jobId;
      filteration.profileId = uuidv4();
      filteration.userId = uuidv4();
      filteration.email = `applicant${i}@example.com`;
      filteration.currentStage = StageType.interview;
      filteration.interviewData = {
        interviewDate: new Date(),
        answers: [`Answer ${i}`],
        recordedAnswers: [`Recording ${i}`],
        jobTitle: 'Software Engineer',
        deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      };
      return filteration;
    });

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));

    const result = await filteringService.getInterviewedApplicants(userId, jobId, paginationOptions);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.page).toBe(2);
    expect(result.metadata.take).toBe(5);
    expect(result.metadata.itemCount).toBe(15);
    expect(result).toHaveProperty('appliedUsers');
    expect(result.appliedUsers).toHaveLength(5); // Should return 5 applicants in page 2
  });

  it('should start the quiz stage successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Active;

    const job = {
      id: jobId,
      currentStage: JobStageType.Quiz,
      title: 'Software Engineer',
    } as StructuredJob;

    const quizzes = [
      { userId: uuidv4(), email: 'test1@example.com', identifier: 'quiz1' },
      { userId: uuidv4(), email: 'test2@example.com', identifier: 'quiz2' },
    ];

    const users = [
      { id: quizzes[0].userId, firstName: 'John', lastName: 'Doe' },
      { id: quizzes[1].userId, firstName: 'Jane', lastName: 'Smith' },
    ];

    const filterations = quizzes.map((quiz, i) => ({
      jobId,
      profileId: uuidv4(),
      userId: quiz.userId,
      email: 'test@example.com',
      currentStage: StageType.applied,
      isQualified: i % 2 === 0,
    }));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockQuizService.send.mockImplementation(() => of(quizzes));
    mockUserService.send.mockImplementation(() => of(users));

    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Quiz);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    updatedFilterations.forEach((filteration) => {
      const quiz = quizzes.find((q) => q.userId === filteration.userId);
      if (filteration.isQualified) {
        expect(filteration.currentStage).toBe(StageType.quiz);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });

  });

  it('should start the interview stage successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Quiz;

    const job = {
      id: jobId,
      currentStage: JobStageType.Interview,
      userId: uuidv4(),
      title: 'Software Engineer',
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      },
    } as StructuredJob;

    const filterations = Array.from({ length: 5 }, (_, i) => ({
      jobId,
      profileId: uuidv4(),
      userId: uuidv4(),
      email: 'test@example.com',
      currentStage: StageType.quiz,
      isQualified: i % 2 === 0,
      quizData: { quizDate: new Date() },
    }));

    const usersScores = filterations.map((f, i) => ({
      userId: f.userId,
      percentage: i % 2 === 0 ? 100 : 0,
    }));

    const users = filterations.map((f, i) => ({
      id: f.userId,
      firstName: `User${i}`,
      lastName: `Test${i}`,
    }));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockQuizService.send.mockImplementation(() => of({ data: usersScores }));
    mockUserService.send.mockImplementation(() => of(users));

    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Interview);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    updatedFilterations.forEach((filteration) => {
      if (filteration.isQualified) {
        expect(filteration.currentStage).toBe(StageType.interview);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });

  });

  it('should start the final stage successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Interview;

    const job = {
      id: jobId,
      currentStage: JobStageType.Final,
      userId: uuidv4(),
      title: 'Software Engineer',
      company: 'Tech Company',
    } as StructuredJob;

    const filterations = Array.from({ length: 5 }, (_, i) => ({
      jobId,
      profileId: uuidv4(),
      email: 'test@example.com',
      userId: uuidv4(),
      currentStage: StageType.interview,
      isQualified: i % 2 === 0,
      interviewData: { interviewDate: new Date(), grade: i % 2 === 0 ? 100 : 20 },
    }));

    const users = filterations.map((f, i) => ({
      id: f.userId,
      firstName: `User${i}`,
      lastName: `Test${i}`,
    }));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockUserService.send.mockImplementation(() => of(users));

    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Final);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    updatedFilterations.forEach((filteration) => {
      if (filteration.interviewData.grade > FILTERATION_CONSTANTS.INTERVIEW_PASS_THRESHOLD) {
        expect(filteration.currentStage).toBe(StageType.candidate);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });
  });

  it('should throw exception if job is not found', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Active;

    mockJobService.send.mockImplementation(() => of(null));

    await expect(filteringService.beginCurrentStage(jobId, previousStage)).rejects.toThrow(FILTERATION_CONSTANTS.JOB_NOT_FOUND);
  });

  it('should throw exception if current stage is invalid', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Active;

    const job = {
      id: jobId,
      isActive: true,
      currentStage: 'Invalid stage',
    };

    mockJobService.send.mockImplementation(() => of(job));

    await expect(filteringService.beginCurrentStage(jobId, previousStage)).rejects.toThrow(FILTERATION_CONSTANTS.NOT_VALID_STAGE);
  });

  it('should start the final stage from quiz successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Quiz;

    const job = {
      id: jobId,
      currentStage: JobStageType.Final,
      userId: uuidv4(),
      title: 'Software Engineer',
      company: 'Tech Company',
    } as StructuredJob;

    const filterations = Array.from({ length: 5 }, (_, i) => ({
      jobId,
      profileId: uuidv4(),
      userId: uuidv4(),
      email: 'test@example.com',
      currentStage: StageType.quiz,
      isQualified: i % 2 === 0,
      quizData: { quizDate: new Date(), grade: 80 + i },
    }));

    const users = filterations.map((f, i) => ({
      id: f.userId,
      firstName: `User${i}`,
      lastName: `Test${i}`,
    }));

    const quizScores = {
      data: filterations.map((f, i) => ({
        userId: f.userId,
        percentage: i % 2 === 0 ? 100 : 0
      }))
    };


    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockUserService.send.mockImplementation(() => of(users));
    mockQuizService.send.mockImplementation(() => of(quizScores));

    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Final);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    updatedFilterations.forEach((filteration) => {
      if (filteration.isQualified) {
        expect(filteration.currentStage).toBe(StageType.candidate);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });

  });

  it('should start the final stage from active successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Active;

    const job = {
      id: jobId,
      currentStage: JobStageType.Final,
      userId: uuidv4(),
      title: 'Software Engineer',
      company: 'Tech Company',
    } as StructuredJob;

    const filterations = Array.from({ length: 5 }, (_, i) => ({
      jobId,
      profileId: uuidv4(),
      userId: uuidv4(),
      email: 'test@example.com',
      currentStage: StageType.applied,
      isQualified: i % 2 === 0
    }));

    const users = filterations.map((f, i) => ({
      id: f.userId,
      firstName: `User${i}`,
      lastName: `Test${i}`,
    }));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockUserService.send.mockImplementation(() => of(users));

    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Final);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    updatedFilterations.forEach((filteration) => {
      if (filteration.isQualified) {
        expect(filteration.currentStage).toBe(StageType.candidate);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });

  });

  it('should start the interview stage from active successfully', async () => {
    const jobId = uuidv4();
    const previousStage = JobStageType.Active;

    const job = {
      id: jobId,
      currentStage: JobStageType.Interview,
      userId: uuidv4(),
      title: 'Software Engineer',
      stages: {
        interview: {
          interviewQuestions: ['What is your name?', 'Why do you want this job?'],
        },
      }
    } as StructuredJob;

    const filterations = Array.from({ length: 5 }, (_, i) => ({
      jobId,
      profileId: uuidv4(),
      userId: uuidv4(),
      email: 'test@example.com',
      currentStage: StageType.applied,
      isQualified: i % 2 === 0,
    }));

    const users = filterations.map((f, i) => ({
      id: f.userId,
      firstName: `User${i}`,
      lastName: `Test${i}`,
    }));

    const filterationRepository = filteringService['filterationRepository'];
    await filterationRepository.save(filterations);

    mockJobService.send.mockImplementation(() => of(job));
    mockUserService.send.mockImplementation(() => of(users));
    const result = await filteringService.beginCurrentStage(jobId, previousStage);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('stage');
    expect(result.stage).toBe(JobStageType.Interview);
    expect(result.message).toBe(FILTERATION_CONSTANTS.STAGE_STARTED);

    const updatedFilterations = await filterationRepository.find({ where: { jobId } });
    console.log(updatedFilterations);
    updatedFilterations.forEach((filteration) => {
      if (filteration.isQualified) {
        expect(filteration.currentStage).toBe(StageType.interview);
      } else {
        expect(filteration.currentStage).toBe(StageType.failed);
      }
    });
  });
});
