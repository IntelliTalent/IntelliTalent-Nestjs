import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppliedUsers,
  Constants,
  CustomJobsStages,
  Interview,
  JobSource,
  ServiceName,
  StageType,
  StructuredJob,
  UnstructuredJobs,
} from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateJobDto,
  EditJobDto,
  IJobs,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { isDefined } from 'class-validator';
import { JobsPageOptionsDto } from '@app/services_communications/jobs-service/dtos/get-jobs.dto';
import { GetUserJobsDto } from '@app/services_communications/jobs-service/dtos/get-user-jobs.dto';
import { ApplyJobDto } from '@app/services_communications';

@Injectable()
export class JobsService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(StructuredJob)
    readonly structuredJobRepository: Repository<StructuredJob>,
    @InjectRepository(AppliedUsers)
    private readonly appliedUsersRepository: Repository<AppliedUsers>,
    @InjectRepository(CustomJobsStages)
    private readonly customJobsStagesRepository: Repository<CustomJobsStages>,
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectModel(UnstructuredJobs.name)
    private readonly unstructuredJobsModel: Model<UnstructuredJobs>,
    @Inject(ServiceName.SCRAPPER_SERVICE)
    private readonly scrapperService: ClientProxy,
    @Inject(ServiceName.JOB_EXTRACTOR_SERVICE)
    private readonly jobExtractorService: ClientProxy,
    @Inject(ServiceName.ATS_SERVICE)
    private readonly atsService: ClientProxy,
    @Inject(ServiceName.FILTERATION_SERVICE)
    private readonly filtrationService: ClientProxy,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private async insertScrappedJobsToRedis(jobs: StructuredJob[]) {
    try {
      // Convert the jobs array to a string
      const jobsString = jobs.map((job) =>
        JSON.stringify({
          id: job.id,
          title: job.title,
          company: job.company,
          url: job.url,
          skills: job.skills,
          neededExperience: job.neededExperience,
          csRequired: job.csRequired,
          customFilters: null,
        }),
      );

      // Append the jobs to the existing list in Redis
      await this.redis.rpush('jobs', ...jobsString);

      console.log('Jobs appended successfully.');
    } catch (error) {
      console.error(`Error appending jobs: ${error.message}`);
    }
  }

  private async insertCreatedJobsToRedis(job: StructuredJob) {
    try {
      // Convert the jobs array to a string
      const jobString = JSON.stringify({
        id: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        skills: job.skills,
        neededExperience: job.neededExperience,
        csRequired: job.csRequired,
        customFilters: job.stages.customFilters,
      });

      // Append the jobs to the existing list in Redis
      await this.redis.rpush('jobs', jobString);

      console.log('Job appended successfully.');
    } catch (error) {
      console.error(`Error appending jobs: ${error.message}`);
    }
  }

  private async callATSService() {
    try {
      const length = await this.redis.llen('jobs');

      if (length > 100) {
        this.atsService.emit(
          {
            cmd: jobsServicePatterns.match,
          },
          {},
        );
      }
    } catch (error) {
      console.error(`Error calling ATS service: ${error.message}`);
    }
  }

  private getJobName(jobId: string, type: string) {
    switch (type) {
      case 'job':
        return `jobEndDate-${jobId}`;
      case 'quiz':
        return `quizEndDate-${jobId}`;
      case 'interview':
        return `interviewEndDate-${jobId}`;
      default:
        throw new BadRequestException('Invalid Job Name Type');
    }
  }

  private async deactivateJobAndBeginNextStage(job: StructuredJob) {
    const currentStage = job.currentStage;

    // If the job is already scheduled, remove it
    const jobName = this.getJobName(job.id, 'job');
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    // Update the job to inactive
    job.isActive = false;

    // Update the current stage of the job
    if (job.stages?.quizEndDate) {
      job.currentStage = StageType.Quiz;
    } else if (job.stages?.interview) {
      job.currentStage = StageType.Interview;
    } else {
      job.currentStage = StageType.Final;
    }

    await this.structuredJobRepository.save(job);

    // Call the filtration service to begin the next stage
    await firstValueFrom(
      this.filtrationService.send(
        {
          cmd: jobsServicePatterns.beginCurrentStage,
        },
        { jobId: job.id, previousStage: currentStage },
      ),
    );
  }

  private async moveJobToNextStage(job: StructuredJob) {
    const currentStage = job.currentStage;

    // Update the current stage of the job
    if (job.currentStage === StageType.Quiz && job.stages?.interview) {
      // Stop the quiz cron job
      const jobName = this.getJobName(job.id, 'quiz');
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        const existingJob = this.schedulerRegistry.getCronJob(jobName);
        existingJob.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
      }

      job.currentStage = StageType.Interview;
    } else if (job.currentStage === StageType.Interview) {
      // Stop the interview cron job
      const jobName = this.getJobName(job.id, 'interview');
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        const existingJob = this.schedulerRegistry.getCronJob(jobName);
        existingJob.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
      }

      job.currentStage = StageType.Final;
    } else {
      job.currentStage = StageType.Final;
    }

    await this.structuredJobRepository.save(job);

    // Call the filtration service to begin the next stage
    await firstValueFrom(
      this.filtrationService.send(
        {
          cmd: jobsServicePatterns.beginCurrentStage,
        },
        { jobId: job.id, previousStage: currentStage },
      ),
    );
  }

  private scheduleJobEnd(job: StructuredJob): void {
    const jobName = this.getJobName(job.id, 'job');

    // If the job is already scheduled, remove it before scheduling a new one
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    const jobEndDate = new Date(job.jobEndDate);

    const cronJob = new CronJob(jobEndDate, async () => {
      await this.deactivateJobAndBeginNextStage(job);
    });

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
  }

  private scheduleQuizEnd(job: StructuredJob): void {
    const jobName = this.getJobName(job.id, 'quiz');

    // If the job is already scheduled, remove it before scheduling a new one
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    const quizEndDate = new Date(job.stages.quizEndDate);

    const cronJob = new CronJob(quizEndDate, async () => {
      await this.moveJobToNextStage(job);
    });

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
  }

  private scheduleInterviewEnd(job: StructuredJob): void {
    const jobName = this.getJobName(job.id, 'interview');

    // If the job is already scheduled, remove it before scheduling a new one
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      existingJob.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    const interviewEndDate = new Date(job.stages.interview.endDate);

    const cronJob = new CronJob(interviewEndDate, async () => {
      await this.moveJobToNextStage(job);
    });

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
  }

  async createJob(newJob: CreateJobDto) {
    // Check that dates are valid

    // check if job endDate is after now
    if (newJob.jobEndDate && new Date(newJob.jobEndDate) < new Date()) {
      throw new BadRequestException('Job end date must be after now');
    }

    // Check that interview end date is after quiz end date
    if (newJob.quizEndDate && newJob.interview?.endDate) {
      if (newJob.interview?.endDate < newJob.quizEndDate) {
        throw new BadRequestException(
          'Interview end date must be after quiz end date',
        );
      }
    }

    // Check that interview end date is after job end date
    if (newJob.jobEndDate && newJob.interview?.endDate) {
      if (newJob.jobEndDate > newJob.interview?.endDate) {
        throw new BadRequestException(
          'Interview end date must be after job end date',
        );
      }
    }

    // Check that the quiz end date is after the quiz end date
    if (newJob.quizEndDate && newJob.jobEndDate) {
      if (newJob.jobEndDate > newJob.quizEndDate) {
        throw new BadRequestException(
          'Quiz end date must be after job end date',
        );
      }
    }

    // Check if there is an interview in the new job
    let interview: Interview | null = null;
    if (newJob.interview) {
      interview = this.interviewRepository.create({
        interviewQuestions: newJob.interview.interviewQuestions,
        endDate: newJob.interview.endDate,
      });

      await this.interviewRepository.save(interview);
    }

    // Create a custom job stage entity
    const customJobStage = this.customJobsStagesRepository.create({
      interview: interview,
      quizEndDate: newJob.quizEndDate,
      customFilters: newJob.customFilters,
    });
    await this.customJobsStagesRepository.save(customJobStage);

    // Create the structured job entity
    const structuredJob = this.structuredJobRepository.create({
      userId: newJob.userId,
      title: newJob.title,
      company: newJob.company,
      jobLocation: newJob.jobLocation,
      type: newJob.type,
      skills: newJob.skills,
      description: newJob.description,
      jobPlace: newJob.jobPlace,
      neededExperience: newJob.neededExperience,
      education: newJob.education,
      csRequired: newJob.csRequired,
      jobEndDate: newJob.jobEndDate,
      stages: customJobStage,
    });

    // Set additional fields
    structuredJob.url = '';
    structuredJob.publishedAt = new Date();
    structuredJob.isActive = true;
    structuredJob.isScrapped = false;

    // Save the structured job entity to get the generated id
    const savedJob = await this.structuredJobRepository.save(structuredJob);

    // Set the url with the generated id
    const frontEndUrl = await getConfigVariables(Constants.FRONT_END_URL);
    savedJob.url = `${frontEndUrl}/jobs/${savedJob.id}`;

    // Update the saved job with the constructed URL
    await this.structuredJobRepository.save(savedJob);

    // Save the structured job to Redis
    this.insertCreatedJobsToRedis(savedJob);

    // Fire the matching event to the ATS service
    this.callATSService();

    // Schedule the end dates
    if (newJob.jobEndDate) {
      this.scheduleJobEnd(savedJob);
    }
    if (newJob.quizEndDate) {
      this.scheduleQuizEnd(savedJob);
    }
    if (newJob.interview) {
      this.scheduleInterviewEnd(savedJob);
    }

    return savedJob;
  }

  async editJob(editJob: EditJobDto) {
    const {
      jobId,
      userId,
      customFilters,
      interview,
      jobEndDate,
      quizEndDate,
      ...rest
    } = editJob;

    // Check if the job exists
    const existingJob = await this.structuredJobRepository.findOne({
      where: { id: jobId },
      relations: ['stages', 'stages.interview'],
    });
    if (!existingJob) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    // Check if the user is the owner of the job
    if (existingJob.userId !== userId) {
      throw new ForbiddenException('Can not edit a job of another user');
    }

    for (const [key, value] of Object.entries(rest)) {
      if (isDefined(value)) {
        existingJob[key] = value;
      }
    }

    if (customFilters) {
      for (const [key, value] of Object.entries(customFilters)) {
        if (isDefined(value)) {
          existingJob.stages.customFilters[key] = value;
        }
      }
    }

    if (jobEndDate) {
      // Check that the job end date is before the quiz end date and before the interview end date
      if (
        (quizEndDate && quizEndDate < jobEndDate) ||
        (!quizEndDate &&
          existingJob.stages.quizEndDate &&
          existingJob.stages.quizEndDate < jobEndDate)
      ) {
        throw new BadRequestException(
          'Job end date must be before quiz end date',
        );
      }

      if (
        (interview && interview.endDate < jobEndDate) ||
        (!interview &&
          existingJob.stages.interview &&
          existingJob.stages.interview.endDate < jobEndDate)
      ) {
        throw new BadRequestException(
          'Job end date must be before interview end date',
        );
      }

      existingJob.jobEndDate = jobEndDate;
      this.scheduleJobEnd(existingJob);
    }

    if (quizEndDate) {
      // Check that the quiz end date is after the job end date and before the interview end date
      if (
        (jobEndDate && jobEndDate > quizEndDate) ||
        (!jobEndDate &&
          existingJob.jobEndDate &&
          existingJob.jobEndDate > quizEndDate)
      ) {
        throw new BadRequestException(
          'Quiz end date must be after job end date',
        );
      }

      if (
        (interview && interview.endDate < quizEndDate) ||
        (!interview &&
          existingJob.stages.interview &&
          existingJob.stages.interview.endDate < quizEndDate)
      ) {
        throw new BadRequestException(
          'Quiz end date must be before interview end date',
        );
      }

      existingJob.stages.quizEndDate = quizEndDate;
      this.scheduleQuizEnd(existingJob);
    }

    if (interview) {
      // Check that the interview end date is after the job end date and after the quiz end date
      if (
        (jobEndDate && jobEndDate > interview.endDate) ||
        (!jobEndDate &&
          existingJob.jobEndDate &&
          existingJob.jobEndDate > interview.endDate)
      ) {
        throw new BadRequestException(
          'Interview end date must be after job end date',
        );
      }

      if (
        (quizEndDate && quizEndDate > interview.endDate) ||
        (!quizEndDate &&
          existingJob.stages.quizEndDate &&
          existingJob.stages.quizEndDate > interview.endDate)
      ) {
        throw new BadRequestException(
          'Interview end date must be after quiz end date',
        );
      }

      // Check if there was an old interview remove it
      if (existingJob.stages.interview) {
        await this.interviewRepository.delete({
          id: existingJob.stages.interview.id,
        });
      }

      const newInterview = this.interviewRepository.create({
        interviewQuestions: interview.interviewQuestions,
        endDate: interview.endDate,
      });

      await this.interviewRepository.save(newInterview);

      existingJob.stages.interview = newInterview;
      this.scheduleInterviewEnd(existingJob);
    }

    // Save the updated job entity
    await this.structuredJobRepository.save(existingJob);

    return existingJob;
  }

  async getJobById(jobId: string, userId: string = null) {
    const job = await this.structuredJobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    let hasApplied = false;

    // Check if the user has applied for the job
    if (userId) {
      const application = await this.appliedUsersRepository.findOne({
        where: {
          jobId: job.id,
          userId: userId,
        },
      });
      hasApplied = !!application;
    }

    // Map the job entity to IJobs format
    const responseJob: IJobs = {
      id: job.id,
      userId: job.userId,
      title: job.title,
      company: job.company,
      jobLocation: job.jobLocation,
      type: job.type,
      skills: job.skills,
      url: job.url,
      description: job.description,
      publishedAt: job.publishedAt,
      jobPlace: job.jobPlace,
      neededExperience: job.neededExperience,
      education: job.education,
      csRequired: job.csRequired,
      isActive: job.isActive,
      currentStage: job.currentStage,
      source: job.jobSource,
      isApplied: userId ? hasApplied : null,
    };
    return responseJob;
  }

  async getJobDetailsById(
    jobId: string,
    userId: string = null,
  ): Promise<StructuredJob> {
    // return the job with left joining CustomJobsStages
    const job = await this.structuredJobRepository.findOne({
      where: { id: jobId },
      relations: ['stages', 'stages.interview'],
    });

    if (!job) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    let hasApplied = false;

    // Check if the user has applied for the job
    if (userId) {
      const application = await this.appliedUsersRepository.findOne({
        where: {
          jobId: job.id,
          userId: userId,
        },
      });
      hasApplied = !!application;
    }

    Object.assign(job, { isApplied: userId ? hasApplied : null });
    Object.assign(job, { source: job.jobSource });

    return job;
  }

  async getJobs(pageOptions: JobsPageOptionsDto) {
    const {
      jobTitle,
      jobLocation,
      publishDate,
      jobType,
      jobPlace,
      jobSource,
      csRequired,
      take,
      page,
      userId,
    } = pageOptions;

    // Calculate skip
    let skip = undefined;
    if (page && take) {
      skip = (page - 1) * take;
    }

    const queryBuilder = this.structuredJobRepository.createQueryBuilder('job');

    // Apply jobTitle if provided
    if (jobTitle) {
      queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:jobTitle)', {
        jobTitle: `%${jobTitle}%`,
      });
    }

    // Apply jobLocation if provided
    if (jobLocation) {
      queryBuilder.andWhere('LOWER(job.jobLocation) LIKE LOWER(:jobLocation)', {
        jobLocation: `%${jobLocation}%`,
      });
    }

    // Apply csRequired if provided
    if (csRequired) {
      queryBuilder.andWhere('job.csRequired = :csRequired', {
        csRequired: csRequired === 'Yes' ? true : false,
      });
    }

    // Apply jobType if provided
    if (jobType) {
      const jobTypes = Array.isArray(jobType) ? jobType : [jobType];
      queryBuilder.andWhere('job.type IN (:...jobTypes)', {
        jobTypes,
      });
    }

    // Apply jobPlace if provided
    if (jobPlace) {
      const jobPlaces = Array.isArray(jobPlace) ? jobPlace : [jobPlace];
      queryBuilder.andWhere('job.jobPlace IN (:...jobPlaces)', {
        jobPlaces,
      });
    }

    // Apply jobSource if provided
    if (jobSource) {
      const jobSources = (
        Array.isArray(jobSource) ? jobSource : [jobSource]
      ).map((source) => {
        // Map each string value to its corresponding JobSource enum value
        switch (source.toLowerCase()) {
          case 'intellitalent':
            return JobSource.IntelliTalent;
          case 'linkedin':
            return JobSource.LinkedIn;
          case 'wuzzuf':
            return JobSource.Wuzzuf;
          default:
            throw new BadRequestException(`Unknown job source: ${source}`);
        }
      });

      queryBuilder.andWhere('job.source IN (:...jobSources)', {
        jobSources,
      });
    }

    // Apply publishDate if provided
    if (publishDate) {
      let date: Date;
      const today = new Date();
      switch (publishDate) {
        case 'Last 24 hours':
          date = new Date(today.setDate(today.getDate() - 1));
          break;
        case 'Last 7 days':
          date = new Date(today.setDate(today.getDate() - 7));
          break;
        case 'Last 30 days':
          date = new Date(today.setDate(today.getDate() - 30));
          break;
        case 'Last 3 months':
          date = new Date(today.setMonth(today.getMonth() - 3));
          break;
        default:
          date = null;
      }
      if (date) {
        queryBuilder.andWhere('job.publishedAt >= :publishDate', {
          publishDate: date.toISOString(),
        });
      }
    }

    // Apply condition for currentStage to be Active
    queryBuilder.andWhere('job.currentStage = :currentStage', {
      currentStage: StageType.Active,
    });

    // Apply condition for job to be Active
    queryBuilder.andWhere('job.isActive = :isActive', { isActive: true });

    // Apply pagination
    queryBuilder.skip(skip).take(take);

    // Execute query and map the results to IJobs format
    const [jobs, count] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);

    const responseJobs: IJobs[] = jobs.map((job) => ({
      id: job.id,
      userId: job.userId,
      title: job.title,
      company: job.company,
      jobLocation: job.jobLocation,
      type: job.type,
      skills: job.skills,
      url: job.url,
      description: job.description,
      publishedAt: job.publishedAt,
      jobPlace: job.jobPlace,
      neededExperience: job.neededExperience,
      education: job.education,
      csRequired: job.csRequired,
      isActive: job.isActive,
      currentStage: job.currentStage,
      source: StructuredJob.getJobSourceFromEnum(job.source),
      isApplied: userId ? false : null,
    }));

    if (userId) {
      // get jobs Ids
      const jobsIds = responseJobs.map((job) => job.id);

      // get the IDs of the jobs the user has applied for
      const appliedJobsIds = await this.appliedUsersRepository
        .find({
          select: ['jobId'],
          where: {
            userId,
            jobId: In(jobsIds),
          },
        })
        .then((appliedJobs) => appliedJobs.map((job) => job.jobId));


      // update the isApplied field
      responseJobs.forEach((job) => {
        job.isApplied = appliedJobsIds.includes(job.id);
      });
    }

    return {
      jobs: responseJobs,
      totalRecords: count,
      totalPages: Math.ceil(count / (take || 10)),
    };
  }

  async getUserJobs(getUserJobsDto: GetUserJobsDto) {
    const queryBuilder = this.structuredJobRepository
      .createQueryBuilder('job')
      .where('job.userId = :userId', { userId: getUserJobsDto.userId });

    const { page, take } = getUserJobsDto.pageOptionsDto;

    // Calculate skip
    let skip = undefined;
    if (page && take) {
      skip = (page - 1) * take;
    }

    // Apply pagination
    queryBuilder.skip(skip).take(take);

    // Execute query and map the results to IJobs format
    const [jobs, count] = await queryBuilder.getManyAndCount();

    const responseJobs: IJobs[] = jobs.map((job) => ({
      id: job.id,
      userId: job.userId,
      title: job.title,
      company: job.company,
      jobLocation: job.jobLocation,
      type: job.type,
      skills: job.skills,
      url: job.url,
      description: job.description,
      publishedAt: job.publishedAt,
      jobPlace: job.jobPlace,
      neededExperience: job.neededExperience,
      education: job.education,
      csRequired: job.csRequired,
      isActive: job.isActive,
      currentStage: job.currentStage,
      source: job.jobSource,
    }));

    return {
      jobs: responseJobs,
      totalRecords: count,
      totalPages: Math.ceil(count / (take || 10)),
    };
  }

  async checkActiveJobs() {
    console.log('Checking active jobs');

    // Read all jobs
    const jobs = await this.structuredJobRepository.find({
      where: { isActive: true, isScrapped: true },
    });

    // create an array of job ids, url, and jobId
    const jobsToCheck = jobs.map((job) => ({
      id: job.id,
      jobId: job.jobId,
      url: job.url,
    }));

    // Call scrapper service to check the jobs and return list of ids and isActive
    const updatedJobs = JSON.parse(
      await firstValueFrom(
        this.scrapperService.send(
          {
            cmd: jobsServicePatterns.checkActiveJobs,
          },
          { jobs: jobsToCheck },
        ),
      ),
    );

    console.log(updatedJobs);

    // Update the jobs using the ids and isActive
    const bulkUpdatePromises = updatedJobs['jobs'].map(({ id, isActive }) =>
      this.structuredJobRepository.update({ id }, { isActive }),
    );

    await Promise.all(bulkUpdatePromises);
  }

  async callJobExtractor() {
    console.log('Calling job extractor service');

    // Get all the scrapped jobs
    const unstructuredJobs = await this.unstructuredJobsModel
      .find({
        deletedAt: null,
      })
      .limit(70);

    // Call the job extractor service
    const structuredJobs = JSON.parse(
      await firstValueFrom(
        this.jobExtractorService.send(
          {
            cmd: jobsServicePatterns.extractInfo,
          },
          {
            jobs: unstructuredJobs,
          },
        ),
      ),
    );

    // Soft delete each unstructured job
    const bulkDeletePromises = [];
    for (const job of unstructuredJobs) {
      job.deletedAt = new Date();
      job.company = job.company || 'N/A';
      job.jobLocation = job.jobLocation || 'N/A';
      bulkDeletePromises.push(job.save());
    }
    try {
      await Promise.all(bulkDeletePromises);
    } catch (error) {
      console.log(`Error deleting jobs: ${error.message}`);
    }

    // Save the structured jobs
    const addedJobs = [];
    const bulkInsertPromises = structuredJobs['jobs'].map((job: any) => {
      try {
        addedJobs.push(job);
        job.source = StructuredJob.getJobSource(job.url);
        return this.structuredJobRepository.save(job as any);
      } catch (error) {
        console.error(`Error saving job: ${error.message}`);
        return;
      }
    });
    try {
      await Promise.all(bulkInsertPromises);
    } catch (error) {
      console.log(`Error saving jobs: ${error.message}`);
    }

    // if the number of jobs is less than 1, return that mean dont call the ats or the redis
    if (addedJobs.length < 1) {
      return;
    }

    // Insert the new jobs to redis
    await this.insertScrappedJobsToRedis(addedJobs);

    // Fire the matching event to the ATS service
    await this.callATSService();
  }

  async deactivateJob(jobId: string, userId: string) {
    // Check if the job exists
    const existingJob = await this.structuredJobRepository.findOne({
      where: { id: jobId },
      relations: ['stages', 'stages.interview'],
    });
    if (!existingJob) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    // Check if the user is the owner of the job
    if (existingJob.userId !== userId) {
      throw new ForbiddenException('Can not deactivate a job of another user');
    }

    // Check if the job is active
    if (!existingJob.isActive) {
      throw new BadRequestException('Can not deactivate an inactive job');
    }

    // Deactivate the job
    await this.deactivateJobAndBeginNextStage(existingJob);

    return {
      message: 'Job deactivated successfully.',
    };
  }

  async moveToNextStage(jobId: string, userId: string) {
    // Check if the job exists
    const existingJob = await this.structuredJobRepository.findOne({
      where: { id: jobId },
      relations: ['stages', 'stages.interview'],
    });
    if (!existingJob) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    // Check if the user is the owner of the job
    if (existingJob.userId !== userId) {
      throw new ForbiddenException(
        'Can not move a job of another user to next stage',
      );
    }

    // Check if the job is active
    if (existingJob.isActive) {
      throw new BadRequestException(
        'Can not move a job that is active to next stage',
      );
    }

    // Check if the job is in Final stage
    if (existingJob.currentStage === StageType.Final) {
      throw new BadRequestException(
        'Can not move a job that is in Final stage to next stage',
      );
    }

    // Deactivate the job
    await this.moveJobToNextStage(existingJob);

    return {
      message: 'Job moved to next stage successfully.',
    };
  }

  async userApply(applyDro: ApplyJobDto) {
    const { jobId, userId } = applyDro;

    // check if the job Exist With that User
    const appliedJob = await this.appliedUsersRepository.findOne({
      where: { jobId, userId },
    });

    if (appliedJob) {
      console.log('You Already Applied For This Job');
      // throw new BadRequestException('You Already Applied For This Job');
    }

    // append the user to the job
    const appliedUser = this.appliedUsersRepository.create({
      userId,
      jobId,
    });

    return await this.appliedUsersRepository.save(appliedUser);
  }
}
