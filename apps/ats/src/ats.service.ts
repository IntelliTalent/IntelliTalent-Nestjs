import { userServicePatterns } from '@app/services_communications';
import { Filteration, Profile, ServiceName, User, UserType } from '@app/shared';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { log, profile } from 'console';
import { Redis } from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { In, Repository } from 'typeorm';

@Injectable()
export class AtsService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @Inject(ServiceName.USER_SERVICE)
    private readonly userService: ClientProxy,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Filteration)
    private readonly filterationRepository: Repository<Filteration>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  validateCustomFilters(jobFilters: object, profile: Profile): boolean {
    for (const filter in jobFilters) {
      if (filter === 'languages') {
        if (!jobFilters[filter].every((lang: string) => profile.languages.includes(lang))) {
          return false;
        }
      } else if (filter === 'city' || filter === 'country') {
        if (profile[filter] !== jobFilters[filter]) {
          return false;
        }
      } else if (filter === 'yearsOfExperience') {
        if (profile[filter] < jobFilters[filter]) {
          return false;
        }
      }
    }
    return true;
  }

  async getJobs() {
    const jobsString = await this.redis.lrange('jobs', 0, -1);
    const jobs = jobsString.map((job) => JSON.parse(job));

    return jobs;
  }

  async deleteJobs() {
    await this.redis.del('jobs');
  }

  async match(): Promise<object> {
    try {
      // get jobs from REDIS_JOBS_DB Redis DB, and delete them
      const jobs = await this.getJobs();

      if (jobs.length === 0) {
        console.log('no jobs to match!');
        return {
          status: "no jobs to match!"
        };
      }

      await this.deleteJobs();

      // TODO: get all users from Users DB
      /*const users: User[] = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.getAllUsers,
          },
          {},
        ),
      );*/

      const users: User[] = [
        {
          id: "81a83574-4759-4dff-97ea-245a13b51d74",
          email: "moaz25jan2015@gmail.com",
          password: "54fasfas",
          firstName: "Moaz",
          lastName: "Mohamed",
          phoneNumber: "01111111111",
          dateOfBirth: new Date(),
          type: UserType.jobSeeker,
          isVerified: true,
          country: "Egypt",
          city: "Cairo",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          address: null,
          photo: null,
        },
        {
          id: "97a83064-4759-4dff-97ea-245a13b51d74",
          email: "waer@gmail.com",
          password: "54fasfas",
          firstName: "Waer",
          lastName: "Alwaer",
          phoneNumber: "01111111111",
          dateOfBirth: new Date(),
          type: UserType.jobSeeker,
          isVerified: true,
          country: "Algeria",
          city: "Algiers",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          address: null,
          photo: null,
        }
      ]

      // TODO: get all profiles of these users from Profiles DB
      /*const profiles = await this.profileRepository.find({
        where: {
          userId: In(users.map(user => user.id)),
        },
      });*/

      const profiles: Profile[] = [
        {
          id: "81a83064-47e9-4def-97ea-245a13b51d74",
          userId: users[0].id,
          skills: ["Python", "R", "SQL"],
          yearsOfExperience: 5,
          graduatedFromCS: true,
          languages: ["English"],
          jobTitle: "Data Scientist",
          summary: "I am a data scientist with 5 years of experience in Python, R, and SQL.",
          cv: "",
          linkedIn: "",
          gitHub: "",
          educations: [],
          experiences: [],
          projects: [],
          certificates: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: "81a83064-4759-4dff-97ea-eada13b51d74",
          userId: users[1].id,
          skills: ["Java", "Python", "JavaScript", "React", "Node.js"],
          yearsOfExperience: 3,
          graduatedFromCS: true,
          languages: ["Arabic", "English"],
          jobTitle: "Data Scientist",
          summary: "I am a data scientist with 5 years of experience in Python, R, and SQL.",
          cv: "",
          linkedIn: "",
          gitHub: "",
          educations: [],
          experiences: [],
          projects: [],
          certificates: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }
      ];

      const profileUsers = profiles.map(profile => {
        const matchedUser = users.find(user => user.id === profile.userId);
        return {
          ...profile,
          email: matchedUser.email,
          country: matchedUser.country,
          city: matchedUser.city,
        }
      });

      // { email1: { job1 data }, email2: { job2 data } }
      let matches = {};

      jobs.forEach(job => {
        const numOfSkills = job.skills.length;

        profileUsers.forEach(profile => {
          // check if there is custom filters in the job
          if (job.customFilters) {
            // validate custom filters, if no match, continue to the next profile
            const isValid = this.validateCustomFilters(job.customFilters, profile);

            if (!isValid) {
              return;
            }
          }

          let matchedSkills = 0;

          job.skills.forEach(skill => {
            if (profile.skills.includes(skill)) {
              matchedSkills++;
            }
          });
          
          const matchScore = matchedSkills / numOfSkills;

          // 0.5 is the threshold for matching
          if (matchScore >= 0.5) {
            // don't send matching email to the same email even if 2 profiles with the same mail are matched
            if (!matches[profile.email]) {
              matches[profile.email] = {
                jobId: job.id,
                profileId: profile.id,
                jobTitle: job.title,
                company: job.company,
                url: job.url,
                matchScore,
              }
            }
            console.log(`job: ${job.title} matches profile: ${profile.email}`);
          }
        });
      });

      // TODO: get all emails from REDIS_MAILING_DB Redis DB in both queues sendmail, checkmail, 
      // and remove any user from matches if his email is in sendmail, or in checkmail with period less than 6 hours,
      // if it is in checkmail with period more than 6 hours, remove it from checkmail

      // convert matches object to array
      const matchesArray = Object.keys(matches).map(email => {
        return {
          email,
          ...matches[email]
        }
      });

      console.log(matchesArray);

      console.log('matching is done!');

      // TODO: put these mails in REDIS_MAILING_DB Redis DB in sendmail queue

      // add records for these matches in filteration DB
      /*const filterations = matchesArray.map(match => {
        return {
          jobId: match.jobId,
          profileId: match.profileId,
          stageData: {
            matchScore: match.matchScore,
          }
        }
      });

      await this.filterationRepository.save(filterations);*/

      return {
        status: "matching is done!"
      };
    } catch (error) {
      console.log(error);
      return {
        status: "error in matching!"
      };
    }
  }
}
