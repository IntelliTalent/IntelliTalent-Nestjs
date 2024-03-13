import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomJobsStages, Interview, StructuredJob } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateJobDto,
  EditJobDto,
} from '@app/services_communications/jobs-service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(StructuredJob)
    private readonly structuredJobRepository: Repository<StructuredJob>,
    @InjectRepository(CustomJobsStages)
    private readonly customJobsStagesRepository: Repository<CustomJobsStages>,
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async createJob(newJob: CreateJobDto) {
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
    });

    // Set additional fields
    structuredJob.url = `http://localhost:5173/jobs/${structuredJob.id}`;
    structuredJob.publishedAt = new Date();
    structuredJob.isActive = true;
    structuredJob.isScrapped = false;

    await this.structuredJobRepository.save(structuredJob);

    return structuredJob;
  }

  async editJob(editJob: EditJobDto) {
    // Check if the job exists
    const existingJob = await this.structuredJobRepository.findOne({
      where: { id: editJob.jobId },
      relations: ['stages'],
    });
    if (!existingJob) {
      throw new RpcException(
        new NotFoundException(`Can not find a job with id: ${editJob.jobId}`),
      );
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
  }
}
