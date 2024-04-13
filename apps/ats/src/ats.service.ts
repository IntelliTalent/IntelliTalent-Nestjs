import { profileServicePattern, userServicePatterns } from '@app/services_communications';
import { Filteration, Profile, ServiceName, User, UserType } from '@app/shared';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
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
    @Inject(ServiceName.PROFILE_SERVICE)
    private readonly profileService: ClientProxy,
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

      // get all users from Users service
      const data: any = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.getAllJobSeekers,
          },
          {
            // TODO: just a large number, should be replaced with pagination based on current ATS container @ Waer
            take: 1000000,
          },
        ),
      );

      const users: User[] = data.data;

      // get all profiles of these users from Profiles service
      const profiles = await firstValueFrom(
        this.profileService.send(
          {
            cmd: profileServicePattern.getProfilesByUsersIds,
          },
          {
            usersIds: users.map(user => user.id),
          },
        ),
      );

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

      console.log("matches ", matchesArray);

      console.log('matching is done!');

      // TODO: put these mails in REDIS_MAILING_DB Redis DB in sendmail queue

      // add records for these matches in filteration DB
      const filterations = matchesArray.map(match => {
        return {
          jobId: match.jobId,
          profileId: match.profileId,
          stageData: {
            matchScore: match.matchScore,
          }
        }
      });

      await this.filterationRepository.save(filterations);

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
