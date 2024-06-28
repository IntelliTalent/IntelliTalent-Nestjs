import { Test, TestingModule } from '@nestjs/testing';
import {
  CustomJobsStages,
  Interview,
  JobPlace,
  JobType,
  ServiceName,
  SharedModule,
  StructuredJob,
  TypeOrmSQLITETestingModule,
  UnstructuredJobs,
  UnstructuredJobsSchema,
  User,
  UserType,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllowedUserTypes, CreateUserDto } from '@app/services_communications';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { JobsService } from './jobs.service';
import { ClientProxy } from '@nestjs/microservices';
import { MongoDBName } from '@app/shared/config/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisDBName } from '@app/shared/config/redis.config';
import {
  CreateJobDto,
  EditJobDto,
} from '@app/services_communications/jobs-service';
import { fa, faker } from '@faker-js/faker';
import { JobsPageOptionsDto } from '@app/services_communications/jobs-service/dtos/get-jobs.dto';
import { send } from 'process';

describe('JobsService', () => {
  let service: JobsService;
  let scrapperServiceMock: any;
  let jobExtractorServiceMock: any;
  let atsServiceMock: any;
  let filtrationServiceMock: any;

  let testJobDto: CreateJobDto = {
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    jobLocation: faker.location.city(),
    type: faker.helpers.enumValue(JobType),
    skills: Array.from({ length: 5 }, () => faker.lorem.word()),
    description: faker.lorem.paragraph(),
    jobPlace: faker.helpers.enumValue(JobPlace),
    neededExperience: faker.number.int({
      min: 1,
      max: 10,
    }),
    education: faker.lorem.sentence(),
    csRequired: faker.datatype.boolean(),
    quizEndDate: new Date('2024-11-12'),
    interview: {
      endDate: new Date('2024-12-12'),
      interviewQuestions: [faker.lorem.sentence()],
    },
    jobEndDate: new Date('2024-10-12'),
    customFilters: {
      languages: [faker.lorem.word()],
      country: faker.location.country(),
      city: faker.location.city(),
    },
    userId: faker.string.uuid(),
  };

  const createJobDto = (data: Partial<CreateJobDto>) => {
    return {
      ...testJobDto,
      ...data,
    };
  };

  const tempRMQService = {
    send: jest.fn().mockImplementation(() => of({})),
    emit: jest.fn(),
    connect: jest.fn(() => Promise.resolve()),
    close: jest.fn(() => Promise.resolve()),
    subscribe: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    scrapperServiceMock = tempRMQService;
    scrapperServiceMock.send = jest.fn().mockImplementation(() =>
      of(
        JSON.stringify({
          jobs: [
            {
              id: faker.string.uuid(),
              isActive: faker.datatype.boolean(),
            },
          ],
        }),
      ),
    );

    jobExtractorServiceMock = tempRMQService;
    atsServiceMock = tempRMQService;
    filtrationServiceMock = tempRMQService;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // mocking the database postgres
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [StructuredJob, CustomJobsStages, Interview],
          true,
        ),
        TypeOrmModule.forFeature([StructuredJob, CustomJobsStages, Interview]),

        // mocking mongo
        SharedModule.registerMongoDB(MongoDBName.ScrappedJobsDB),
        MongooseModule.forFeature([
          {
            name: UnstructuredJobs.name,
            schema: UnstructuredJobsSchema,
            collection: ServiceName.TESTING_DATABASE,
          },
        ]),

        // add the schedule module
        ScheduleModule.forRoot(),

        // mocking redis
        SharedModule.registerRedis(RedisDBName.testingDB1),
      ],
      providers: [
        JobsService,
        {
          provide: ServiceName.SCRAPPER_SERVICE,
          useValue: scrapperServiceMock,
        },
        {
          provide: ServiceName.JOB_EXTRACTOR_SERVICE,
          useValue: jobExtractorServiceMock,
        },
        {
          provide: ServiceName.ATS_SERVICE,
          useValue: atsServiceMock,
        },
        {
          provide: ServiceName.FILTERATION_SERVICE,
          useValue: filtrationServiceMock,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

    it('should throw an error if interview end date is before quiz end date', async () => {
      const invalidJobDto = { ...testJobDto, quizEndDate: new Date('2024-12-13') };
      await expect(service.createJob(invalidJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if interview end date is before job end date', async () => {
      const invalidJobDto = { ...testJobDto, interview: { ...testJobDto.interview, endDate: new Date('2024-09-12') } };
      await expect(service.createJob(invalidJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if quiz end date is before job end date', async () => {
      const invalidJobDto = { ...testJobDto, quizEndDate: new Date('2024-09-12') };
      await expect(service.createJob(invalidJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if job end date is before current date', async () => {
      const invalidJobDto = { ...testJobDto, jobEndDate: new Date('2021-09-12') };
      await expect(service.createJob(invalidJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should create a job', async () => {
      const result = await service.createJob(testJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('jobLocation');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('skills');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('jobPlace');
      expect(result).toHaveProperty('neededExperience');
      expect(result).toHaveProperty('education');
      expect(result).toHaveProperty('csRequired');
      expect(result).toHaveProperty('jobEndDate');
    })

    it('should throw an error if the job does not exist while updating', async () => {
      await expect(service.editJob({
        jobId: faker.string.uuid(),
        userId: faker.string.uuid(),
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if the user is not the owner of the job', async () => {
      const createdJob = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: createdJob.id,
        userId: faker.string.uuid(),
      };
      await expect(service.editJob(editJobDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error if quiz end date is before job end date', async () => {
      const createdJob = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: createdJob.id,
        quizEndDate: new Date('2024-10-11'),
      };
      await expect(service.editJob(editJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if quiz end date is before job end date', async () => {
      const createdJob = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: createdJob.id,
        quizEndDate: new Date('2024-10-11'),
      };
      await expect(service.editJob(editJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if interview end date is before job end date', async () => {
      const createdJob = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: createdJob.id,
        interview: {
          endDate: new Date('2024-10-11'),
          interviewQuestions: [faker.lorem.sentence()],
        },
      };
      await expect(service.editJob(editJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if interview end date is before quiz end date', async () => {
      const createdJob = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: createdJob.id,
        interview: {
          endDate: new Date('2024-11-11'),
          interviewQuestions: [faker.lorem.sentence()],
        },
      };
      await expect(service.editJob(editJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should update the job title', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        title: faker.person.jobTitle(),
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result.title).toBe(editJobDto.title);
    });

    it('should update the job description', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        description: faker.lorem.paragraph(),
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('description');
      expect(result.description).toBe(editJobDto.description);
    });

    it('should update the job place', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        jobPlace: faker.helpers.enumValue(JobPlace),
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('jobPlace');
      expect(result.jobPlace).toBe(editJobDto.jobPlace);
    });

    it('should update the needed experience', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        neededExperience: faker.number.int({ min: 1, max: 10 }),
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('neededExperience');
      expect(result.neededExperience).toBe(editJobDto.neededExperience);
    });

    it('should update the education', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        education: faker.lorem.sentence(),
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('education');
      expect(result.education).toBe(editJobDto.education);
    });

    it('should update the csRequired', async () => {
      const job = await service.createJob(testJobDto);
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        csRequired: !testJobDto.csRequired,
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('csRequired');
      expect(result.csRequired).toBe(editJobDto.csRequired);
    });

    it('should update the quizEndDate', async () => {
      const job = await service.createJob(testJobDto);
      const newQuizEndDate = new Date('2024-12-12');
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        quizEndDate: newQuizEndDate,
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('stages');
      expect(result.stages).toHaveProperty('quizEndDate');
      expect(new Date(result.stages.quizEndDate)).toEqual(newQuizEndDate);
    });

    it('should update the interview', async () => {
      const job = await service.createJob(testJobDto);
      const newInterviewEndDate = new Date('2024-12-20');
      const newInterviewQuestions = [faker.lorem.sentence(), faker.lorem.sentence()];
      const editJobDto: EditJobDto = {
        ...testJobDto,
        jobId: job.id,
        interview: {
          endDate: newInterviewEndDate,
          interviewQuestions: newInterviewQuestions,
        },
      };
      const result = await service.editJob(editJobDto);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('stages');
      expect(result.stages).toHaveProperty('interview');
      expect(result.stages.interview).toHaveProperty('endDate');
      expect(new Date(result.stages.interview.endDate)).toEqual(newInterviewEndDate);
      expect(result.stages.interview).toHaveProperty('interviewQuestions');
      expect(result.stages.interview.interviewQuestions).toEqual(newInterviewQuestions);
    });

    it('should throw an error if the job does not exist', async () => {
      const nonExistentJobId = faker.string.uuid();
      await expect(service.getJobById(nonExistentJobId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should retrieve a job by ID', async () => {
      const createdJob = await service.createJob(testJobDto);
      const result = await service.getJobById(createdJob.id);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', createdJob.id);
      expect(result).toHaveProperty('userId', createdJob.userId);
      expect(result).toHaveProperty('title', createdJob.title);
      expect(result).toHaveProperty('company', createdJob.company);
      expect(result).toHaveProperty('jobLocation', createdJob.jobLocation);
      expect(result).toHaveProperty('type', createdJob.type);
      expect(result).toHaveProperty('skills', createdJob.skills);
      expect(result).toHaveProperty('url', createdJob.url);
      expect(result).toHaveProperty('description', createdJob.description);
      expect(result).toHaveProperty('publishedAt', createdJob.publishedAt);
      expect(result).toHaveProperty('jobPlace', createdJob.jobPlace);
      expect(result).toHaveProperty(
        'neededExperience',
        createdJob.neededExperience,
      );
      expect(result).toHaveProperty('education', createdJob.education);
      expect(result).toHaveProperty('csRequired', createdJob.csRequired);
      expect(result).toHaveProperty('isActive', createdJob.isActive);
      expect(result).toHaveProperty('currentStage', createdJob.currentStage);
    });

    it('should throw an error if the job does not exist', async () => {
      const nonExistentJobId = faker.string.uuid();;
      await expect(service.getJobDetailsById(nonExistentJobId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should retrieve job details by ID with related stages and interview', async () => {
      const createdJob = await service.createJob(testJobDto);
      const result = await service.getJobDetailsById(createdJob.id);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', createdJob.id);
      expect(result).toHaveProperty('userId', createdJob.userId);
      expect(result).toHaveProperty('title', createdJob.title);
      expect(result).toHaveProperty('company', createdJob.company);
      expect(result).toHaveProperty('jobLocation', createdJob.jobLocation);
      expect(result).toHaveProperty('type', createdJob.type);
      expect(result).toHaveProperty('skills', createdJob.skills);
      expect(result).toHaveProperty('description', createdJob.description);
      expect(result).toHaveProperty('publishedAt', createdJob.publishedAt);
      expect(result).toHaveProperty('jobPlace', createdJob.jobPlace);
      expect(result).toHaveProperty(
        'neededExperience',
        createdJob.neededExperience,
      );
      expect(result).toHaveProperty('education', createdJob.education);
      expect(result).toHaveProperty('csRequired', createdJob.csRequired);
      expect(result).toHaveProperty('isActive', createdJob.isActive);
      expect(result).toHaveProperty('currentStage', createdJob.currentStage);
      expect(result).toHaveProperty('stages');
      expect(result.stages).toHaveProperty(
        'customFilters',
        createdJob.stages.customFilters,
      );
      expect(result.stages).toHaveProperty('interview');
      expect(result.stages.interview).toHaveProperty(
        'interviewQuestions',
        createdJob.stages.interview.interviewQuestions,
      );
    });

    it('should retrieve paginated jobs with job title filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        jobTitle: createdJob.title,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', createdJob.title);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with job location filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        jobLocation: createdJob.jobLocation,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty(
        'jobLocation',
        createdJob.jobLocation,
      );
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with csRequired filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        csRequired: createdJob.csRequired ? 'Yes' : 'No',
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('csRequired', createdJob.csRequired);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with job type filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        jobType: createdJob.type,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('type', createdJob.type);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with job place filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        jobPlace: createdJob.jobPlace,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('jobPlace', createdJob.jobPlace);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with publish date filter', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        publishDate: 'Last 7 days',
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('publishedAt');
      expect(new Date(result.jobs[0].publishedAt)).toBeInstanceOf(Date);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should retrieve paginated jobs with multiple filters', async () => {
      const createdJob = await service.createJob(testJobDto);
      const pageOptions: JobsPageOptionsDto = {
        jobTitle: createdJob.title,
        jobLocation: createdJob.jobLocation,
        csRequired: createdJob.csRequired ? 'Yes' : 'No',
        jobType: createdJob.type,
        jobPlace: createdJob.jobPlace,
        publishDate: 'Last 7 days',
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', createdJob.title);
      expect(result.jobs[0]).toHaveProperty(
        'jobLocation',
        createdJob.jobLocation,
      );
      expect(result.jobs[0]).toHaveProperty('csRequired', createdJob.csRequired);
      expect(result.jobs[0]).toHaveProperty('type', createdJob.type);
      expect(result.jobs[0]).toHaveProperty('jobPlace', createdJob.jobPlace);
      expect(result.jobs[0]).toHaveProperty('publishedAt');
      expect(new Date(result.jobs[0].publishedAt)).toBeInstanceOf(Date);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return paginated results', async () => {
      // Create multiple jobs to test pagination
      for (let i = 0; i < 15; i++) {
        await service.createJob(testJobDto);
      }
      const pageOptions: JobsPageOptionsDto = {
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(10);
      expect(result.totalRecords).toBe(15);
      expect(result.totalPages).toBe(2);
    }, 20000);

    it('should return only matched jobs with filters', async () => {
      const job1 = await service.createJob({ ...testJobDto , title: 'Developer', jobLocation: 'New York', type: JobType.FullTime });
      const job2 = await service.createJob({ ...testJobDto , title: 'Tester', jobLocation: 'San Francisco', type: JobType.PartTime });
      const job3 = await service.createJob({ ...testJobDto , title: 'Manager', jobLocation: 'Chicago', type: JobType.Contract });

      const pageOptions: JobsPageOptionsDto = {
        jobTitle: 'Developer',
        jobLocation: 'New York',
        jobType: JobType.FullTime,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', job1.title);
      expect(result.jobs[0]).toHaveProperty('jobLocation', job1.jobLocation);
      expect(result.jobs[0]).toHaveProperty('type', job1.type);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return only matched jobs with filters', async () => {
      const job1 = await service.createJob({ ...testJobDto, title: 'Developer', jobLocation: 'New York', type: JobType.FullTime });
      const job2 = await service.createJob({ ...testJobDto, title: 'Tester', jobLocation: 'San Francisco', type: JobType.PartTime });
      const job3 = await service.createJob({ ...testJobDto, title: 'Manager', jobLocation: 'Chicago', type: JobType.Contract });

      const pageOptions: JobsPageOptionsDto = {
        jobTitle: 'Developer',
        jobLocation: 'New York',
        jobType: JobType.FullTime,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', job1.title);
      expect(result.jobs[0]).toHaveProperty('jobLocation', job1.jobLocation);
      expect(result.jobs[0]).toHaveProperty('type', job1.type);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return only matched jobs with job title and location filters', async () => {
      const job1 = await service.createJob({ ...testJobDto, title: 'Developer', jobLocation: 'New York' });
      const job2 = await service.createJob({ ...testJobDto, title: 'Tester', jobLocation: 'San Francisco' });
      const job3 = await service.createJob({ ...testJobDto, title: 'Developer', jobLocation: 'Chicago' });

      const pageOptions: JobsPageOptionsDto = {
        jobTitle: 'Developer',
        jobLocation: 'New York',
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', job1.title);
      expect(result.jobs[0]).toHaveProperty('jobLocation', job1.jobLocation);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return only matched jobs with job type and place filters', async () => {
      const job1 = await service.createJob({ ...testJobDto, type: JobType.FullTime, jobPlace: JobPlace.OnSite });
      const job2 = await service.createJob({ ...testJobDto, type: JobType.PartTime, jobPlace: JobPlace.Remote });
      const job3 = await service.createJob({ ...testJobDto, type: JobType.Contract, jobPlace: JobPlace.OnSite });

      const pageOptions: JobsPageOptionsDto = {
        jobType: JobType.FullTime,
        jobPlace: JobPlace.OnSite,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('type', job1.type);
      expect(result.jobs[0]).toHaveProperty('jobPlace', job1.jobPlace);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return only matched jobs with csRequired filter', async () => {
      const job1 = await service.createJob({ ...testJobDto, csRequired: true });
      const job2 = await service.createJob({ ...testJobDto, csRequired: false });

      const pageOptions: JobsPageOptionsDto = {
        csRequired: 'Yes',
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('csRequired', job1.csRequired);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return matched jobs with multiple filters', async () => {
      const job1 = await service.createJob({ ...testJobDto, title: 'Developer', jobLocation: 'New York', type: JobType.FullTime, jobPlace: JobPlace.OnSite });
      const job2 = await service.createJob({ ...testJobDto, title: 'Tester', jobLocation: 'San Francisco', type: JobType.PartTime, jobPlace: JobPlace.Remote });
      const job3 = await service.createJob({ ...testJobDto, title: 'Manager', jobLocation: 'Chicago', type: JobType.Contract, jobPlace: JobPlace.OnSite });

      const pageOptions: JobsPageOptionsDto = {
        jobTitle: 'Developer',
        jobLocation: 'New York',
        jobType: JobType.FullTime,
        jobPlace: JobPlace.OnSite,
        page: 1,
        take: 10,
      };

      const result = await service.getJobs(pageOptions);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]).toHaveProperty('title', job1.title);
      expect(result.jobs[0]).toHaveProperty('jobLocation', job1.jobLocation);
      expect(result.jobs[0]).toHaveProperty('type', job1.type);
      expect(result.jobs[0]).toHaveProperty('jobPlace', job1.jobPlace);
      expect(result.totalRecords).toBe(1);
      expect(result.totalPages).toBe(1);
    });

  it('should return all jobs for a specific user', async () => {
      const userId = faker.string.uuid();
      const job1 = await service.createJob(createJobDto({ userId }));
      const job2 = await service.createJob(createJobDto({ userId }));
      const job3 = await service.createJob(createJobDto({ userId: faker.string.uuid() }));

      const result = await service.getUserJobs(userId);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(2);
      expect(result.jobs[0]).toHaveProperty('userId', userId);
      expect(result.jobs[1]).toHaveProperty('userId', userId);
    });

    it('should return an empty array if no jobs found for a user', async () => {
      const userId = faker.string.uuid();

      const result = await service.getUserJobs(userId);

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(0);
    });

    it('should call scrapperService to check job activation', async () => {
      await service.checkActiveJobs();
      expect(scrapperServiceMock.send).toHaveBeenCalled();
    });

  it('should call jobsServicePatterns', async () => {
      await service.callJobExtractor()
      expect(jobExtractorServiceMock.send).toHaveBeenCalled()
  })

  it('should throw an error if the job does not exist', async () => {
      const jobId = faker.string.uuid();
      const userId = faker.string.uuid();

      await expect(service.deactivateJob(jobId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if the user is not the owner of the job', async () => {
      const userId = faker.string.uuid();
      const anotherUserId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      await expect(service.deactivateJob(job.id, anotherUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error if the job is already inactive', async () => {
      const userId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      await service.deactivateJob(job.id, userId)

      await expect(service.deactivateJob(job.id, userId)).rejects.toThrow(BadRequestException);
    });

    it('should deactivate the job successfully', async () => {
      const userId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      const result = await service.deactivateJob(job.id, userId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Job deactivated successfully.');
    });

    it('should throw an error if the job does not exist', async () => {
      const jobId = faker.string.uuid();
      const userId = faker.string.uuid();

      await expect(service.moveToNextStage(jobId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if the user is not the owner of the job', async () => {
      const userId = faker.string.uuid();
      const anotherUserId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      await expect(
        service.moveToNextStage(job.id, anotherUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error if the job is active', async () => {
      const userId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      await expect(service.moveToNextStage(job.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the job is in Final stage', async () => {
      const userId = faker.string.uuid();
      const job = await service.createJob(createJobDto({ userId }));

      await service.deactivateJob(job.id, userId);

      await service.moveToNextStage(job.id, userId);

      await service.moveToNextStage(job.id, userId);

      await expect(service.moveToNextStage(job.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

  it('should move the job to the next stage successfully', async () => {
    const userId = faker.string.uuid();
    const job = await service.createJob(createJobDto({ userId }));

    await service.deactivateJob(job.id, userId);

    const result = await service.moveToNextStage(job.id, userId);

    expect(result).toBeDefined();
    expect(result.message).toBe('Job moved to next stage successfully.');
  });
});
