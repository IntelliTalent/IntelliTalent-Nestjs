import { profileServicePattern, userServicePatterns } from '@app/services_communications';
import { MATCHING_THRESHOLD } from '@app/services_communications/ats-service';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import { jobsServicePatterns } from '@app/services_communications/jobs-service';
import { EmailTemplates } from '@app/services_communications/notifier/constants/templates';
import { notifierServicePattern } from '@app/services_communications/notifier/patterns/notifier-service.patterns';
import { CustomFilters, Filteration, Profile, ServiceName, StructuredJob, User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
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
    @Inject(ServiceName.NOTIFIER_SERVICE)
    private readonly notifierService: ClientProxy,
    @InjectRepository(Filteration)
    private readonly filterationRepository: Repository<Filteration>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  private _validateCustomFilters(jobFilters: CustomFilters, profile: Profile): boolean {
    for (const filter in jobFilters) {
      if (filter === 'languages') {
        if (!jobFilters[filter].every((lang: string) => profile.languages.includes(lang))) {
          return false;
        }
      } else if (filter === 'city' || filter === 'country' || filter === 'graduatedFromCS') {
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

  private async _getMailingKeys() {
    const mailingKeys = await this.mailingRedisDB.keys('*');
    return mailingKeys;
  }

  private async _deleteJobs() {
    await this.jobsRedisDB.del('jobs');
  }

  private _calculateMatchScore(job: StructuredJob, profile: any): number {
    let matchedSkills = 0;

    job.skills.forEach(skill => {
      if (profile.skills.includes(skill)) {
        matchedSkills++;
      }
    });

    // TODO: matchedSkills is a number not percentage
    // TODO: get difference between user's yearsOfExperience and job's yearsOfExperience (default = 0 if not asked)
    // TODO: add score for job title matching in every experience if the job title is equal to it
    // TODO: add score for every project, of project skills matching and project size
    // TODO: think for equation for this
    
    return matchedSkills / job.skills.length;
  }

  async match(): Promise<object> {
    try {
      // get jobs from REDIS_JOBS_DB Redis DB, and delete them
      const jobs = await this._getJobs();

      if (jobs.length === 0) {
        return {
          status: "no jobs to match!"
        };
      }

      await this._deleteJobs();

      // get all users from Users service
      const users: User[] = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.getAllJobSeekers,
          },
          {},
        ),
      );

      // get all emails that are not allowed to send to them, because the mail period (e.g. 1 day) didn't pass yet
      const notAllowedEmails = await this._getMailingKeys();

      // make set to hold all allowed emails
      let allowedEmails = new Set();
      users.forEach(user => {
        if (!notAllowedEmails.includes(user.email))
          allowedEmails.add(user.email);
      });

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
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName,
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
        profileUsers.forEach(profile => {
          // check if there is custom filters in the job
          if (job.customFilters) {
            // validate custom filters, if no match, continue to the next profile
            const isValid = this._validateCustomFilters(job.customFilters, profile);

            if (!isValid) {
              return;
            }
          }

          const matchScore = this._calculateMatchScore(job, profile);

          console.log(`Profile Id: ${profile.id} - Job Id: ${job.id} - Match Score: ${matchScore} - Matching Threshold: ${MATCHING_THRESHOLD}`)

          // MATCHING_THRESHOLD is the threshold for matching
          if (matchScore >= MATCHING_THRESHOLD) {
            // don't send matching email to the same email even if 2 profiles with the same mail are matched
            if (allowedEmails.has(profile.email)) {
              if (!matchedEmailsContents[profile.email]) {
                matchedEmailsContents[profile.email] = {
                  jobTitle: job.title,
                  jobCompany: job.company,
                  jobUrl: job.url,
                  matchScore,
                  matchedJobs: 1,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                }
              }
              else {
                // increment the number of matched jobs
                const newMatchedJobs = matchedEmailsContents[profile.email].matchedJobs++;

                // if the same email is matched with another job, take the job with the highest matchScore
                if (matchedEmailsContents[profile.email].matchScore < matchScore) {
                  matchedEmailsContents[profile.email] = {
                    jobTitle: job.title,
                    jobCompany: job.company,
                    jobUrl: job.url,
                    matchScore,
                    matchedJobs: newMatchedJobs,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                  }
                }
                else {
                  matchedEmailsContents[profile.email].matchedJobs = newMatchedJobs;
                }
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
      
      const matchedEmailsContentsArray = Object.keys(matchedEmailsContents).map((email: string) => {
        return {
          email,
          variables: matchedEmailsContents[email],
        };
      });

      console.log('matchedEmailsContentsArray', matchedEmailsContentsArray);
      
      // send emails to the matched profiles
      this.notifierService.emit(
        {
          cmd: notifierServicePattern.send,
        },
        {
          templateId: EmailTemplates.ATSMATCHED,
          emails: matchedEmailsContentsArray,
        },
      );

      // add records for these matches (all matched not only the sent emails) in filteration DB  
      await this.filterationRepository.save(filterations);
      
      return {
        status: "matching is done!"
      };
    } catch (error) {
      // TODO: uncomment when fixed
      // throw new RpcException(error)
      return {
        status: "error in matching!",
        error
      };
    }
  }

  async matchProfileAndJob(profileAndJobDto: ProfileAndJobDto): Promise<object> {
    try {
      // get job details from Jobs service
      const job: StructuredJob = await firstValueFrom(
        this.jobService.send(
          {
            cmd: jobsServicePatterns.getJobDetailsById,
          },
          profileAndJobDto.jobId
        ),
      );

      if (!job) {
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
        return {
          status: "profile not found!"
        };
      }

      let isValid: boolean = true;

      // check if there is custom filters in the job
      if (job.stages.customFilters) {
        // validate custom filters, if no match, continue to the next profile
        isValid = this._validateCustomFilters(job.stages.customFilters, profile);
      }

      const matchScore = this._calculateMatchScore(job, profile);

      console.log(`Profile Id: ${profile.id} - Job Id: ${job.id} - Match Score: ${matchScore}`)

      return {
        status: "matching is done!",
        matchScore,
        isValid
      };
    } catch (error) {
      // TODO: uncomment when fixed
      // throw new RpcException(error)
      return {
        status: "error in matching!",
        error
      };
    }
  }
}
