import { profileServicePattern, userServicePatterns } from '@app/services_communications';
import * as ATS_CONSTANTS from '@app/services_communications/ats-service';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import { jobsServicePatterns } from '@app/services_communications/jobs-service';
import { EmailTemplates } from '@app/services_communications/notifier/constants/templates';
import { notifierServicePattern } from '@app/services_communications/notifier/patterns/notifier-service.patterns';
import { CustomFilters, Experience, Filteration, Profile, Project, ServiceName, StructuredJob, User } from '@app/shared';
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

  private _validateCustomFilters(jobFilters: CustomFilters, profile: any): boolean {
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

  private _calulateMatchedSkills(skills: string[], jobSkills: string[]): number {
    return skills.filter(skill => jobSkills.includes(skill)).length;
  }

  private _hasWorkedJobTitle(experiences: Experience[], jobTitle: string): boolean {
    return experiences.some(experience => experience.jobTitle === jobTitle);
  }

  private _calculateMatchedProjectsSkillsScore(projects: Project[], jobSkills: string[]): number {
    let matchedProjectsSkills = 0;
    projects.forEach(project => {
      matchedProjectsSkills += this._calulateMatchedSkills(project.skills, jobSkills);
    });

    return matchedProjectsSkills;
  }

  private _calculateMatchScore(job: StructuredJob, profile: any): number {
    // we will assume max score for every part of the total score
    // then get the percentage of every part of the part max score
    // each part of the score will take a percentage of the total score
    // then sum all the parts to get the total score

    let matchedSkills = this._calulateMatchedSkills(profile.skills, job.skills);

    matchedSkills = matchedSkills > job.skills.length ? job.skills.length : matchedSkills;

    const matchedSkillsScore = (matchedSkills / job.skills.length) * ATS_CONSTANTS.ATS_MATCHED_SKILLS_WEIGHT;

    // boolean to check if the job title is equal is included in the profile's experiences job titles
    const hasWorkedJobTitle: boolean = this._hasWorkedJobTitle(profile.experiences, job.title);

    const workedJobTitleScore = (hasWorkedJobTitle ? ATS_CONSTANTS.ATS_MAX_WORKED_JOB_TITLE_SCORE : 0) * ATS_CONSTANTS.ATS_WORKED_JOB_TITLE_WEIGHT;

    // get the years of experience
    let yearsOfExperience = profile.yearsOfExperience > ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE ? ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE : profile.yearsOfExperience;

    const yearsOfExperienceScore = (yearsOfExperience / ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE) * ATS_CONSTANTS.ATS_YEARS_OF_EXPERIENCE_WEIGHT;

    // get title matching score
    let matchedProjectsSkills = this._calculateMatchedProjectsSkillsScore(profile.projects, job.skills);

    matchedProjectsSkills = matchedProjectsSkills > ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE ? ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE : matchedProjectsSkills;

    const matchedProjectsSkillsScore = (matchedProjectsSkills / ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE) * ATS_CONSTANTS.ATS_MATCHED_PROJECTS_SKILLS_WEIGHT;

    // calculate the total score
    const totalScore = matchedSkillsScore + workedJobTitleScore + yearsOfExperienceScore + matchedProjectsSkillsScore;

    return totalScore;
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

          console.log(`Profile Id: ${profile.id} - Job Id: ${job.id} - Match Score: ${matchScore} - Matching Threshold: ${ATS_CONSTANTS.MATCHING_THRESHOLD}`)

          // ATS_CONSTANTS.MATCHING_THRESHOLD is the threshold for matching
          if (matchScore >= ATS_CONSTANTS.MATCHING_THRESHOLD) {
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

      // put country & city in the profileAndUser object
      const profileAndUser = {
        ...profile,
        country: user.country,
        city: user.city,
      };

      let isValid: boolean = true;

      // check if there is custom filters in the job
      if (job.stages.customFilters) {
        // validate custom filters, if no match, continue to the next profile
        isValid = this._validateCustomFilters(job.stages.customFilters, profileAndUser);
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
