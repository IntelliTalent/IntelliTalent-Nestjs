import { of } from 'rxjs';
import { AtsService } from './ats.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CustomFilters,
  Experience,
  Filteration,
  Profile,
  Project,
  ServiceName,
  SharedModule,
  StructuredJob,
  User,
  recentEmailsExpire,
  recentEmailsKey,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ATS_JOBS_REDIS_DB_PROVIDER,
  ATS_MAILING_REDIS_DB_PROVIDER,
} from '@app/services_communications/ats-service';
import { RedisDBName } from '@app/shared/config/redis.config';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import * as ATS_CONSTANTS from '@app/services_communications/ats-service';
import { NotFoundException } from '@nestjs/common';
import {
  NotifierEvents,
  SendEmailsDto,
  profileServicePattern,
  userServicePatterns,
} from '@app/services_communications';

describe('AtsService', () => {
  let atsService: AtsService;
  let mockUserService: any;
  let mockProfileService: any;
  let mockJobService: any;
  let mockNotifierService: any;

  const testJobId = uuidv4();

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Filteration],
          true,
        ),
        TypeOrmModule.forFeature([Filteration]),
      ],
      providers: [
        AtsService,
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
          provide: ATS_JOBS_REDIS_DB_PROVIDER, // provide a token for the jobsRedisDB dependency
          useFactory: async () => {
            const redisUrl = await SharedModule.getRedisDBURL(
              RedisDBName.testingDB1,
            );
            return new Redis(redisUrl);
          },
        },
        {
          provide: ATS_MAILING_REDIS_DB_PROVIDER, // provide a token for the mailingRedisDB dependency
          useFactory: async () => {
            const redisUrl = await SharedModule.getRedisDBURL(
              RedisDBName.testingDB2,
            );
            return new Redis(redisUrl);
          },
        },
      ],
    }).compile();

    atsService = module.get<AtsService>(AtsService);

    // delete jobs from redis
    await atsService['_deleteJobs']();
  });

  it('should be defined', () => {
    expect(atsService).toBeDefined();
  });

  describe('_validateCustomFilters', () => {
    it('should validate custom filters correctly', () => {
      const jobFilters = {
        languages: ['JavaScript', 'Python'],
        city: 'New York',
        yearsOfExperience: 3,
      };

      const profile = {
        languages: ['JavaScript', 'Python', 'C++'],
        city: 'New York',
        yearsOfExperience: 4,
      };

      const result = atsService['_validateCustomFilters'](jobFilters, profile);
      expect(result).toBe(true);
    });

    it('should return false for unmatched languages', () => {
      const jobFilters = { languages: ['JavaScript', 'Python'] };
      const profile = { languages: ['JavaScript', 'C++'] };
      const result = atsService['_validateCustomFilters'](jobFilters, profile);
      expect(result).toBe(false);
    });

    it('should return false for unmatched city', () => {
      const jobFilters = { city: 'New York' };
      const profile = { languages: [], city: 'San Francisco' };
      const result = atsService['_validateCustomFilters'](jobFilters, profile);
      expect(result).toBe(false);
    });
  });

  describe('_validateJobInfo', () => {
    it('should validate job info correctly', () => {
      const job = {
        neededExperience: 3,
        csRequired: true,
      };

      const profile = {
        yearsOfExperience: 5,
        graduatedFromCS: true,
      };

      const result = atsService['_validateJobInfo'](job, profile);
      expect(result).toBe(true);
    });

    it('should return false for unmatched job neededExperience', () => {
      const job = { neededExperience: 3 };
      const profile = { yearsOfExperience: 2 };
      const result = atsService['_validateJobInfo'](job, profile);
      expect(result).toBe(false);
    });
  });

  describe('_getJobs', () => {
    it('should retrieve and parse jobs from Redis', async () => {
      // fill redis jobs
      const jobString = JSON.stringify({
        id: testJobId,
        title: 'Job 1',
        company: 'Company 1',
        url: 'http://example.com',
        skills: ['JavaScript', 'Python'],
        customFilters: {
          languages: ['English', 'Arabic'],
          city: 'New York',
          yearsOfExperience: 3,
        },
      });
      await atsService['jobsRedisDB'].rpush('jobs', jobString);

      const jobs = await atsService['_getJobs']();
      expect(jobs[0].id).toEqual(testJobId);
    });
  });

  describe('_deleteJobs', () => {
    it('should delete jobs from Redis', async () => {
      await atsService['_deleteJobs']();
      const jobs = await atsService['_getJobs']();
      expect(jobs).toEqual([]);
    });
  });

  describe('_calulateMatchedSkills', () => {
    it('should calculate matched skills correctly', () => {
      const skills = ['JavaScript', 'Python', 'C++'];
      const jobSkills = ['JavaScript', 'Java', 'Python'];
      const matchedSkills = atsService['_calulateMatchedSkills'](
        skills,
        jobSkills,
      );
      expect(matchedSkills).toBe(2);
    });

    it('should return 0 for no matched skills', () => {
      const skills = ['Ruby', 'Go'];
      const jobSkills = ['JavaScript', 'Python', 'Java'];
      const matchedSkills = atsService['_calulateMatchedSkills'](
        skills,
        jobSkills,
      );
      expect(matchedSkills).toBe(0);
    });
  });
  describe('_hasWorkedJobTitle', () => {
    const experiences: Experience[] = [
      {
        id: 1,
        jobTitle: 'Software Engineer',
        companyName: 'Company 1',
        startDate: new Date(),
        endDate: new Date(),
        description: null,
        profile: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
      },
      {
        id: 2,
        jobTitle: 'Frontend Developer',
        companyName: 'Company 2',
        startDate: new Date(),
        endDate: new Date(),
        description: null,
        profile: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
      },
    ];
    it('should return true if the job title matches experience', () => {
      const jobTitle = 'Software Engineer';
      const result = atsService['_hasWorkedJobTitle'](experiences, jobTitle);
      expect(result).toBe(true);
    });

    it('should return false if the job title does not match experience', () => {
      const jobTitle = 'Backend Developer';
      const result = atsService['_hasWorkedJobTitle'](experiences, jobTitle);
      expect(result).toBe(false);
    });
  });
  describe('_calculateMatchedProjectsSkillsScore', () => {
    const projects: Project[] = [
      {
        id: 1,
        skills: ['JavaScript', 'Python'],
        name: 'Project 1',
        size: 20,
        description: null,
        profile: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
      },
      {
        id: 2,
        skills: ['C++', 'Java'],
        name: 'Project 2',
        size: 20,
        description: null,
        profile: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
      },
    ];
    it('should calculate matched projects skills score correctly', () => {
      const jobSkills = ['JavaScript', 'Python', 'Java'];
      const result = atsService['_calculateMatchedProjectsSkillsScore'](
        projects,
        jobSkills,
      );
      expect(result).toBe(3);
    });

    it('should return 0 if no skills match', () => {
      const jobSkills = ['Ruby', 'Go'];
      const result = atsService['_calculateMatchedProjectsSkillsScore'](
        projects,
        jobSkills,
      );
      expect(result).toBe(0);
    });
  });
  describe('_emailExists', () => {
    it('should return true if email exists', async () => {
      const email = 'test@example.com';
      const now = Date.now();
      const score = now + recentEmailsExpire;
      await atsService['mailingRedisDB'].zadd(recentEmailsKey, score, email);
      const result = await atsService['_emailExists'](email);
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const email = 'notfound@example.com';
      const result = await atsService['_emailExists'](email);
      expect(result).toBe(false);
    });
  });
  describe('_calculateMatchScore', () => {
    it('should calculate match score correctly', () => {
      const job = {
        skills: ['JavaScript', 'Python'],
        title: 'Software Engineer',
      } as StructuredJob;
      const profile = {
        skills: ['JavaScript', 'Python', 'C++', 'Go'],
        experiences: [{ jobTitle: 'Software Engineer' }],
        yearsOfExperience: 5,
        projects: [
          { skills: ['JavaScript', 'Python'] },
          { skills: ['C++', 'Go'] },
        ],
      };
      const result = atsService['_calculateMatchScore'](job, profile);
      // round to 2 decimal places
      const roundedResult = Math.ceil(result * 100) / 100;
      expect(roundedResult).toBe(0.81);
    });
    it('should calculate match score correctly', () => {
      // test case for small score
      const job = {
        skills: ['JavaScript', 'Python', 'TypeScript'],
        title: 'Software Engineer',
      } as StructuredJob;
      const profile = {
        skills: ['JavaScript', 'R', 'C++', 'Go'],
        experiences: [{ jobTitle: 'Tester' }],
        yearsOfExperience: 1,
        projects: [{ skills: ['JavaScript'] }, { skills: ['C++', 'Go'] }],
      };
      const result = atsService['_calculateMatchScore'](job, profile);
      // round to 2 decimal places
      const roundedResult = Math.ceil(result * 100) / 100;
      expect(roundedResult).toBe(0.2);
    });
  });
  describe('matchProfileAndJob', () => {
    it('should match profile and job correctly', async () => {
      const jobId = uuidv4();
      const profileId = uuidv4();
      const userId = uuidv4();

      const profileAndJobDto = { jobId, profileId } as ProfileAndJobDto;

      const job = {
        id: jobId,
        skills: ['JavaScript', 'Python'],
        title: 'Software Engineer',
        stages: {
          customFilters: {
            languages: ['English', 'Arabic'],
          },
        },
      } as StructuredJob;

      const profile = {
        id: profileId,
        skills: ['JavaScript', 'Python', 'C++'],
        experiences: [{ jobTitle: 'Software Engineer' }],
        yearsOfExperience: 5,
        projects: [
          { skills: ['JavaScript', 'Python'] },
          { skills: ['C++', 'Go'] },
        ],
        userId,
        languages: ['English', 'Arabic'],
      } as Profile;

      const user = {
        id: userId,
        email: 'test@example.com',
      } as User;

      mockJobService.send.mockReturnValue(of(job));
      mockProfileService.send.mockReturnValue(of(profile));
      mockUserService.send.mockReturnValue(of(user));

      const result = await atsService.matchProfileAndJob(profileAndJobDto);

      expect(result['status']).toBe(ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS);
      expect(Math.ceil(result['matchScore'] * 100) / 100).toBe(0.81);
      expect(result['isValid']).toBe(true);
    });

    it('should return job not found error if job does not exist', async () => {
      const jobId = uuidv4();
      const profileId = uuidv4();
      const profileAndJobDto = { jobId, profileId } as ProfileAndJobDto;

      mockJobService.send.mockReturnValue(of(null));
      mockProfileService.send.mockReturnValue(of({}));
      mockUserService.send.mockReturnValue(of({}));

      try {
        await atsService.matchProfileAndJob(profileAndJobDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return profile not found error if profile does not exist', async () => {
      const jobId = uuidv4();
      const profileId = uuidv4();
      const profileAndJobDto = { jobId, profileId } as ProfileAndJobDto;

      mockJobService.send.mockReturnValue(of({}));
      mockProfileService.send.mockReturnValue(of(null));
      mockUserService.send.mockReturnValue(of({}));

      try {
        await atsService.matchProfileAndJob(profileAndJobDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return user not found error if user does not exist', async () => {
      const jobId = uuidv4();
      const profileId = uuidv4();
      const profileAndJobDto = { jobId, profileId } as ProfileAndJobDto;

      mockJobService.send.mockReturnValue(of({}));
      mockProfileService.send.mockReturnValue(of({}));
      mockUserService.send.mockReturnValue(of(null));

      try {
        await atsService.matchProfileAndJob(profileAndJobDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('match', () => {
    it('should return no jobs error if no jobs exist', async () => {
      await atsService['_deleteJobs']();
      try {
        await atsService.match();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    it('should match profiles and jobs correctly and put a record in Filteration', async () => {
      const profileId = uuidv4();
      const userId = uuidv4();

      // fill redis jobs
      const jobString = JSON.stringify({
        id: uuidv4(),
        title: 'Software Engineer',
        company: 'Company 1',
        url: 'http://example.com',
        skills: ['JavaScript', 'Python'],
        customFilters: {
          languages: ['English', 'Arabic'],
        },
      });
      const jobString2 = JSON.stringify({
        id: uuidv4(),
        title: 'Software Engineer',
        company: 'Company 1',
        url: 'http://example.com',
        skills: ['JavaScript', 'Python'],
        customFilters: {
          languages: ['English', 'Arabic'],
        },
      });
      // push them as 2 jobs
      await atsService['jobsRedisDB'].rpush('jobs', jobString);
      await atsService['jobsRedisDB'].rpush('jobs', jobString2);

      const profile = {
        id: profileId,
        skills: ['JavaScript', 'Python', 'C++'],
        experiences: [{ jobTitle: 'Software Engineer' }],
        yearsOfExperience: 5,
        projects: [
          { skills: ['JavaScript', 'Python'] },
          { skills: ['C++', 'Go'] },
        ],
        userId,
        languages: ['English', 'Arabic'],
      } as Profile;

      const user = {
        id: userId,
        email: 'moaz@example.com',
      } as User;

      mockProfileService.send.mockReturnValue(of([profile]));
      mockUserService.send.mockReturnValueOnce(of([user]));

      await atsService.match();

      const filteration: Filteration = await atsService[
        'filterationRepository'
      ].findOne({
        where: {
          profileId,
        },
      });

      expect(filteration.matchData.isValid).toBe(true);
      expect(Math.ceil(filteration.matchData.matchScore * 100) / 100).toBe(
        0.81,
      );

      expect(mockUserService.send).toHaveBeenCalledTimes(2);
      expect(mockProfileService.send).toHaveBeenCalled();
      expect(mockNotifierService.emit).toHaveBeenCalled();
    });
  });
});
