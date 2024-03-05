import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UnstructuredJobs } from '@app/shared';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(UnstructuredJobs.name)
    private readonly unstructuredJobsModel: Model<UnstructuredJobs>,
  ) {
    this.create();
  }

  async create(): Promise<UnstructuredJobs[]> {
    const dummyJobs = [
      {
        title: 'Software Engineer',
        company: 'ABC Technologies',
        jobLocation: 'New York',
        type: 'Full Time',
        skills: ['JavaScript', 'Node.js', 'MongoDB'],
        url: 'https://example.com/job1',
        description: 'This is a description for the Software Engineer position.',
        publishedAt: new Date(),
        scrappedAt: new Date(),
        jobPlace: 'On Site',
        numberOfApplicants: 10,
        neededExperience: 2,
        education: 'Bachelor\'s Degree',
      },
      {
        title: 'Data Scientist',
        company: 'XYZ Analytics',
        jobLocation: 'San Francisco',
        type: 'Contract',
        skills: ['Python', 'Machine Learning', 'Data Analysis'],
        url: 'https://example.com/job2',
        description: 'This is a description for the Data Scientist position.',
        publishedAt: new Date(),
        scrappedAt: new Date(),
        jobPlace: 'Remote',
        numberOfApplicants: 5,
        neededExperience: 3,
        education: 'Master\'s Degree',
      },
      {
        title: 'UX Designer',
        company: '123 Design Studio',
        jobLocation: 'Los Angeles',
        type: 'Part Time',
        skills: ['UI/UX Design', 'Prototyping', 'Wireframing'],
        url: 'https://example.com/job3',
        description: 'This is a description for the UX Designer position.',
        publishedAt: new Date(),
        scrappedAt: new Date(),
        jobPlace: 'Hybrid',
        numberOfApplicants: 3,
        neededExperience: 1,
        education: 'Bachelor\'s Degree',
      },
    ];

    // Create dummy jobs
    const createdJobs = await this.unstructuredJobsModel.create(dummyJobs);

    return createdJobs;
  }
  getHello(): string {
    return 'Hello World!';
  }
}
