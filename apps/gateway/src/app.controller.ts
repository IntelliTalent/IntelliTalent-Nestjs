import { Controller, Get, Inject, Module, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  AVAILABLE_JOB_TITLES,
  JobPlace,
  JobType,
  Profile,
  Public,
  SeederEvent,
  ServiceName,
  StructuredJob,
  User,
  UserType,
} from '@app/shared';
import { ModuleRef } from '@nestjs/core';
import { firstValueFrom, min } from 'rxjs';
import {
  CreateProfileDto,
  profileServicePattern,
} from '@app/services_communications';
import { log } from 'console';
import { skills } from '@app/shared/utils/skills.constant';
import { getRandomElements } from '@app/shared/utils/random';
import { title } from 'process';
import {
  CreateJobDto,
  jobsServicePatterns,
} from '@app/services_communications/jobs-service';
import { faker } from '@faker-js/faker';
import { FilterationServicePattern } from '@app/services_communications/filteration-service/patterns/filteration-service.pattern';
import { AuthApplyJobRequestDto } from '@app/services_communications/filteration-service/dtos/requests/auth-appy-job-request.dto';

@ApiTags('Gateway')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE) private profileService: ClientProxy,
    @Inject(ServiceName.JOB_SERVICE) private jobService: ClientProxy,
    @Inject(ServiceName.FILTERATION_SERVICE)
    private filterationService: ClientProxy,
  ) {
    //  this.seeder();
  }

  private tempProfile: CreateProfileDto = {
    userId: '',
    jobTitle: 'Software Engineer',
    skills: ['JavaScript', 'Node.js'],
    yearsOfExperience: 3,
    graduatedFromCS: true,
    languages: ['English', 'Spanish'],
    summary: 'Experienced software engineer with expertise in web development.',
    cv: 'https://example.com/cv.pdf',
    linkedIn: 'https://linkedin.com/your-profile',
    gitHub: 'https://github.com/your-profile',
    experiences: [
      {
        jobTitle: 'Senior Software Engineer',
        companyName: 'Example Company',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31'),
        description: 'Developed web applications using Angular and Node.js.',
      },
      {
        jobTitle: 'Software Engineer',
        companyName: 'Example Company',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-12-31'),
        description: 'Developed web applications using React and Node.js.',
      },
    ],
    educations: [
      {
        degree: 'Bachelor of Science in Computer Science',
        schoolName: 'University of Example',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-30'),
        description:
          'Studied various computer science topics including algorithms and databases.',
      },
      {
        degree: 'Master of Science in Software Engineering',
        schoolName: 'University of Example',
        startDate: new Date('2022-09-01'),
        endDate: new Date('2024-06-30'),
        description: 'Studied advanced software engineering topics.',
      },
    ],
    projects: [
      {
        name: 'Online Shopping Platform',
        description:
          'Developed an e-commerce platform using React and Node.js.',
        skills: ['React', 'Node.js'],
        size: 5,
      },
      {
        name: 'Social Media App',
        description:
          'Developed a social media application using Angular and NestJS.',
        skills: ['Angular', 'NestJS'],
        size: 3,
      },
    ],
    certificates: [
      {
        title: 'Certificate in Web Development',
        authority: 'Example Authority',
        issuedAt: new Date('2021-01-01'),
        validUntil: new Date('2021-12-31'),
        url: 'https://example.com/certificate.pdf',
      },
      {
        title: 'Certificate in Software Engineering',
        authority: 'Example Authority',
        issuedAt: new Date('2022-01-01'),
        validUntil: new Date('2022-12-31'),
        url: 'https://example.com/certificate.pdf',
      },
    ],
  };

  private tempJob = {
    title: 'Software Engineer',
    company: 'Tech Innovations Inc.',
    jobLocation: 'San Francisco, CA',
    type: JobType.FullTime,
    skills: ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML'],
    description:
      'Join our team as a Software Engineer to develop scalable web applications. You will work closely with product teams to implement new features and improve existing ones. Strong problem-solving skills and a passion for technology are essential.',
    jobPlace: JobPlace.OnSite,
    neededExperience: 3, // In years
    education: "Bachelor's in Computer Science or related field",
    csRequired: true,
    jobEndDate: new Date('2024-12-31T23:59:59.000Z'), // Extended realistic job application deadline
    quizEndDate: new Date('2024-07-31T23:59:59.000Z'), // Deadline for a required quiz part of the application process
    interview: {
      endDate: new Date('2024-08-15T23:59:59.000Z'), // Interview completion deadline
      interviewQuestions: [
        'Describe your experience with front-end development technologies.',
        'How do you approach testing in your development process?',
        "Can you provide an example of a challenging problem you've solved?",
      ],
    },
  };

  @Get('global-health-check')
  getHello() {
    return this.appService.gethealthCheck();
  }

  @ApiOperation({
    description: 'run the seeds',
  })
  @Public()
  @Post('seeder')
  async seeder() {
    console.log('seeder called');

    const usersCount = 20;
    // create x users

    let users: User[] = await firstValueFrom(
      this.userService.send({ cmd: SeederEvent }, usersCount),
    );

    // split the users into 2 arrays one for each type
    const recruiters = users.filter((user) => user.type === UserType.recruiter);
    const jobSeekers = users.filter((user) => user.type === UserType.jobSeeker);

    console.log('users seeded');

    // cerate 9 arrays of skills randomly selected from the skills array
    const skillsArrays = Array(9)
      .fill(null)
      .map(() => getRandomElements(skills, 9));

    const profilesForEachJobSeekerCount = 1;
    let promises = jobSeekers.flatMap((jobSeeker) => {
      // Create a new object for each profile
      const usedJobTitles = new Set<string>(),
        usedSkillsArrays = new Set<string>();

      return Array(profilesForEachJobSeekerCount)
        .fill(null)
        .map(() => {
          let jobTitle, skillsArray;
          do {
            jobTitle = getRandomElements(AVAILABLE_JOB_TITLES, 1)[0];
          } while (usedJobTitles.has(jobTitle));

          do {
            skillsArray = getRandomElements(skillsArrays, 1)[0];
          } while (usedSkillsArrays.has(JSON.stringify(skillsArray)));

          usedSkillsArrays.add(JSON.stringify(skillsArray));
          usedJobTitles.add(jobTitle);

          const projects = this.tempProfile.projects.map((project) => {
            return {
              ...project,
              skills: skillsArray,
            };
          });

          const payload: CreateProfileDto = {
            ...this.tempProfile,
            userId: jobSeeker.id,
            skills: skillsArray,
            jobTitle: jobTitle,
            projects,
          };

          return firstValueFrom(
            this.profileService.send(
              { cmd: profileServicePattern.createProfile },
              payload,
            ),
          );
        });
    });

    // wait for all the profiles to be created
    let profiles2d: Profile[][] = await Promise.all(promises);

    // fllatten the profiles array
    const profiles = profiles2d.flat();

    console.log('profiles seeded');

    const jobsPayloads = recruiters.flatMap((recruiter) => {
      // Create a new object for each job
      return skillsArrays.map((sa) => {
        const payload: CreateJobDto = {
          ...this.tempJob,
          userId: recruiter.id,
          skills: sa,
          company: faker.company.name(),
          csRequired: faker.datatype.boolean(),
          // chose one of the profiles randomly
          title: getRandomElements(profiles, 1)[0].jobTitle,
          neededExperience: faker.number.int({ min: 1, max: 5 }),
        };

        return payload;
      });
    });

    // make the first 3 jobs quiz end Date after 5 mins and jobEnd Date after 2 mins /// interview
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const jobsPayloadsWithInterview: CreateJobDto[] = jobsPayloads
      .slice(0, 3)
      .map((payload) => {
        return {
          ...payload,
          quizEndDate: null,
          jobEndDate: fiveMinutesFromNow,
          interview:{
             endDate: threeDaysFromNow,
             interviewQuestions: payload.interview.interviewQuestions
          }
        };
      });

    // make the next 3 jobs quiz end date after 3 days and the job end date after 5 mins
    const jobsPayloadsWithQuiz = jobsPayloads
      .slice(3, 6)
      .map((payload) => {
        return {
          ...payload,
          quizEndDate: threeDaysFromNow,
          jobEndDate: tenMinutesFromNow,
          interview: null
        };
      });



      const jobsWithoutInterviewOrQuiz = jobsPayloads.slice(6, 9).map((payload) => {
        return {
          ...payload,
          quizEndDate: null,
          jobEndDate: fiveMinutesFromNow,
          interview: null
        };
      })

    // make the remaing jobs the have end data after 5 days and interview after 6 days and the job end date after 2 days
    const jobsPayloadsWithDefaultEndDate = jobsPayloads
      .slice(9)
      .map((payload) => {
        return {
          ...payload,
          quizEndDate: fiveDaysFromNow,
          jobEndDate: twoDaysFromNow,
          interview: {
            ...payload.interview,
            endDate: sixDaysFromNow,
          },
        };
      });

    // merge all the jobs
    const allJobsPayloads = [
      ...jobsPayloadsWithInterview,
      ...jobsPayloadsWithQuiz,
      ...jobsWithoutInterviewOrQuiz,
      ...jobsPayloadsWithDefaultEndDate,
    ];

    console.log('all jobs count', allJobsPayloads.length);

    // create the jobs
    promises = allJobsPayloads.map((payload) => {
      return firstValueFrom(
        this.jobService.send({ cmd: jobsServicePatterns.createJob }, payload),
      );
    });

    // wait for all the jobs to be created
    let jobs: StructuredJob[] = await Promise.all(promises);

    console.log('jobs seeded');

    // lets apply with all users to all jobs
    const jobsApplyPayloads = jobs
      .map((job) => {
        return profiles
          .map((profile) => {
            const profileUser = jobSeekers.find(
              (user) => user.id === profile.userId,
            );
            return {
              jobId: job.id,
              profileId: profile.id,
              userId: profile.userId,
              email: profileUser.email,
            } as AuthApplyJobRequestDto;

          })
          .flat();
      })
      .flat();

      console.log("jobsApplyPayloads", jobsApplyPayloads.length)
      const requestConcurrently = 10;

      // loop and send each 10 jobs and await on them
      for (let i = 0; i < jobsApplyPayloads.length; i += requestConcurrently) {
        const payloads = jobsApplyPayloads.slice(i, Math.min(i + requestConcurrently, jobsApplyPayloads.length));

        const promises = payloads.map((payload) => {
          return firstValueFrom(
            this.filterationService.send(
              { cmd: FilterationServicePattern.filterJob },
              payload,
            ),
          );
        })

        await Promise.all(promises);

        console.log("applied to", i + requestConcurrently, "jobs");
      }



  }
}
