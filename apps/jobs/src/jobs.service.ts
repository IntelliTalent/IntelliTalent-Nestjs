import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Constants,
  CustomJobsStages,
  Interview,
  ServiceName,
  StructuredJob,
  UnstructuredJobs,
} from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateJobDto,
  EditJobDto,
  IJobs,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { ClientProxy } from '@nestjs/microservices';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class JobsService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(StructuredJob)
    private readonly structuredJobRepository: Repository<StructuredJob>,
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

  async createJob(newJob: CreateJobDto) {
    try {
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
        order: newJob.stagesOrder,
        quizEndDate: newJob.quizEndDate,
        customFilters: newJob.customFilters,
      });
      await this.customJobsStagesRepository.save(customJobStage);

      // Create the structured job entity
      const structuredJob = this.structuredJobRepository.create({
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
        userId: newJob.userId,
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
      await this.insertCreatedJobsToRedis(savedJob);

      // Fire the matching event to the ATS service
      await this.callATSService();

      return savedJob;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editJob(editJob: EditJobDto) {
    try {
      // Check if the job exists
      const existingJob = await this.structuredJobRepository.findOne({
        where: { id: editJob.jobId },
        relations: ['stages'],
      });
      if (!existingJob) {
        throw new NotFoundException(
          `Can not find a job with id: ${editJob.jobId}`,
        );
      }

      // Check if the user is the owner of the job
      if (existingJob.userId !== editJob.userId) {
        throw new ForbiddenException('Can not edit a job of another user');
      }

      // Update the job fields
      Object.assign(existingJob, editJob);

      // Update related entities
      if (existingJob.stages) {
        Object.assign(existingJob.stages, {
          customFilters: editJob.customFilters,
          order: editJob.stagesOrder,
          quizEndDate: editJob.quizEndDate,
        });
      }

      if (existingJob.stages && existingJob.stages.interview) {
        Object.assign(existingJob.stages.interview, {
          interviewQuestions: editJob.interview.interviewQuestions,
          endDate: editJob.interview.endDate,
        });
      }

      // Save the updated job entity
      await this.structuredJobRepository.save(existingJob);

      return existingJob;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getJobById(jobId: string) {
    const job = await this.structuredJobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Can not find a job with id: ${jobId}`);
    }

    // Map the job entity to IJobs format
    const responseJob: IJobs = {
      id: job.id,
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
    };
    return responseJob;
  }

  async getJobDetailsById(jobId: string): Promise<StructuredJob> {
    // return the job with left joining CustomJobsStages
    const job = await this.structuredJobRepository.findOne({
      where: { id: jobId },
      relations: ['stages'],
    });

    return job;
  }

  async getJobs(pageOptions: PageOptionsDto) {
    const {
      orderBy,
      orderDirection,
      searchField,
      searchValue,
      startDate,
      endDate,
      skip,
      take,
    } = pageOptions;

    const queryBuilder = this.structuredJobRepository.createQueryBuilder('job');

    // Apply orderBy and orderDirection
    if (orderBy) {
      queryBuilder.orderBy(`job.${orderBy}`, orderDirection);
    }

    // Apply searchField and searchValue
    if (searchField && searchValue) {
      queryBuilder.where(`job.${searchField} LIKE :searchValue`, {
        searchValue: `%${searchValue}%`,
      });
    }

    // Apply startDate and endDate
    if (startDate && endDate) {
      queryBuilder.andWhere('job.publishedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('job.publishedAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('job.publishedAt <= :endDate', { endDate });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(take);

    // Execute query and map the results to IJobs format
    const jobs = await queryBuilder.getMany();

    const responseJobs: IJobs[] = jobs.map((job) => ({
      id: job.id,
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
    }));

    return {
      jobs: responseJobs,
    };
  }

  async checkActiveJobs() {
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

    // Update the jobs using the ids and isActive
    const bulkUpdatePromises = updatedJobs['jobs'].map(({ id, isActive }) =>
      this.structuredJobRepository.update({ id }, { isActive }),
    );

    await Promise.all(bulkUpdatePromises);
  }

  async callJobExtractor() {
    // Get all the scrapped jobs
    const unstructuredJobs = await this.unstructuredJobsModel.find({
      deletedAt: null,
    });

    // Call the job extractor service
    const structuredJobs = JSON.parse(
      await firstValueFrom(
        this.jobExtractorService.send(
          {
            cmd: jobsServicePatterns.extractInfo,
          },
          {
            jobs: [unstructuredJobs[0], unstructuredJobs[1]],
          },
        ),
      ),
    );

    // Soft delete each unstructured job
    const bulkDeletePromises = [];
    for (const job of unstructuredJobs) {
      job.deletedAt = new Date();
      bulkDeletePromises.push(job.save());
    }
    await Promise.all(bulkDeletePromises);

    // Save the structured jobs
    const addedJobs = [];
    const bulkInsertPromises = structuredJobs['jobs'].map(async (job) => {
      try {
        await this.structuredJobRepository.save(job as any);
        addedJobs.push(job);
      } catch (error) {
        return;
      }
    });
    await Promise.all(bulkInsertPromises);

    // Insert the new jobs to redis
    await this.insertScrappedJobsToRedis(addedJobs);

    // Fire the matching event to the ATS service
    await this.callATSService();
  }
}
