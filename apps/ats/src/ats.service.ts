import { profileServicePattern, userServicePatterns } from '@app/services_communications';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import { Filteration, Profile, ServiceName, StructuredJob, User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class AtsService {
  constructor(
    @Inject('JobsRedisDB') 
    private readonly jobsRedisDB: Redis,
    @Inject('MailingRedisDB') 
    private readonly mailingRedisDB: Redis,
    @Inject(ServiceName.USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private readonly profileService: ClientProxy,
    @Inject(ServiceName.JOB_SERVICE)
    private readonly jobService: ClientProxy,
    @InjectRepository(Filteration)
    private readonly filterationRepository: Repository<Filteration>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  private _validateCustomFilters(jobFilters: object, profile: Profile): boolean {
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

  private async _getJobs() {
    const jobsString = await this.jobsRedisDB.lrange('jobs', 0, -1);
    const jobs = jobsString.map((job) => JSON.parse(job));

    return jobs;
  }

  private async _insertMails(key: string, emailContents: Array<object>) {
    // push every email content to the key in the Redis DB
    emailContents.forEach(async (emailContent: object) => {
      await this.mailingRedisDB.rpush(key, JSON.stringify(emailContent));
    });
  }

  private async _deleteJobs() {
    await this.jobsRedisDB.del('jobs');
  }

  async match(): Promise<object> {
    try {
      // get jobs from REDIS_JOBS_DB Redis DB, and delete them
      const jobs = await this._getJobs();

      if (jobs.length === 0) {
        console.log('no jobs to match!');
        return {
          status: "no jobs to match!"
        };
      }

      await this._deleteJobs();

      // get all users from Users service
      const data: any = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.getAllJobSeekers,
          },
          {
            // TODO: just a large number, should be replaced with pagination based on current ATS container @Waer
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
      // unique emails, every email with 1 job only
      let matchedEmailsContents: object = {};

      // will have all matches even if more than job matched the same profile
      let filterations = [];

      jobs.forEach(job => {
        const numOfSkills = job.skills.length;

        profileUsers.forEach(profile => {
          // check if there is custom filters in the job
          if (job.customFilters) {
            // validate custom filters, if no match, continue to the next profile
            const isValid = this._validateCustomFilters(job.customFilters, profile);

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

          // TODO: revise matchScore with @Waer
          
          const matchScore = matchedSkills / numOfSkills;

          // 0.5 is the threshold for matching
          if (matchScore >= 0.5) {
            // don't send matching email to the same email even if 2 profiles with the same mail are matched
            if (!matchedEmailsContents[profile.email]) {
              matchedEmailsContents[profile.email] = {
                jobId: job.id,
                profileId: profile.id,
                jobTitle: job.title,
                company: job.company,
                url: job.url,
                matchScore,
              }
            }
            filterations.push({
              jobId: job.id,
              profileId: profile.id,
              stageData: {
                matchScore,
              }
            });
            console.log(`job: ${job.title} matches profile: ${profile.email}`);
          }
        });
      });

      // TODO: get all emails from REDIS_MAILING_DB Redis DB in both queues sendmail, checkmail, 
      // and remove any user from matches if his email is in sendmail, or in checkmail with period less than 6 hours,
      // if it is in checkmail with period more than 6 hours, remove it from checkmail @Waer

      
      // put these mails in REDIS_MAILING_DB Redis DB in sendmail queue
      // TODO: check this with @Waer
      const matchedEmailsContentsArray = Object.keys(matchedEmailsContents).map((email: string) => {
        return {
          email,
          content: matchedEmailsContents[email],
        };
      });

      console.log('matchedEmailsContentsArray', matchedEmailsContentsArray);
      
      await this._insertMails('sendmail', matchedEmailsContentsArray);

      // add records for these matches in filteration DB  
      await this.filterationRepository.save(filterations);
      
      console.log('matching is done!');
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

  async matchProfileAndJob(profileAndJobDto: ProfileAndJobDto): Promise<object> {
    try {
      // get job details from Jobs service
      const job: StructuredJob = await firstValueFrom(
        this.jobService.send(
          {
            cmd: 'getJobDetailsById',
          },
          profileAndJobDto.jobId
        ),
      );

      if (!job) {
        console.log('job not found!');
        return {
          status: "job not found!"
        };
      }

      // get profile by id from Profile service
      const profile: Profile = await firstValueFrom(
        this.profileService.send(
          {
            cmd: profileServicePattern.getProfileById,
          },
          profileAndJobDto.profileId,
        ),
      );

      if (!profile) {
        console.log('profile not found!');
        return {
          status: "profile not found!"
        };
      }

      // get user by id from User service
      const user: User = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.findUserById,
          },
          profile.userId,
        ),
      );

      if (!user) {
        console.log('user not found!');
        return {
          status: "user not found!"
        };
      }

      // put email, country, city in the profileAnUser object
      const profileAnUser = {
        ...profile,
        email: user.email,
        country: user.country,
        city: user.city,
      };

      const numOfSkills = job.skills.length;

      let isValid: boolean = true;

      // check if there is custom filters in the job
      if (job.stages.customFilters) {
        // validate custom filters, if no match, continue to the next profile
        isValid = this._validateCustomFilters(job.stages.customFilters, profileAnUser);
      }

      let matchedSkills = 0;

      job.skills.forEach(skill => {
        if (profileAnUser.skills.includes(skill)) {
          matchedSkills++;
        }
      });

      // TODO: revise matchScore with @Waer
      
      const matchScore = matchedSkills / numOfSkills;

      return {
        status: "matching is done!",
        matchScore,
        isValid
      };
    } catch (error) {
      console.log(error);
      return {
        status: "error in matching!"
      };
    }
  }
}
