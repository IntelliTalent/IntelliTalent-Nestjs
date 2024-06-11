import {
  AtsEmailTemplateData,
  NotifierEvents,
  SendEmailsDto,
  TemplateData,
  profileServicePattern,
  userServicePatterns,
} from '@app/services_communications';
import * as ATS_CONSTANTS from '@app/services_communications/ats-service';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import {
  MatchData,
  MatchProfileAndJobData,
} from '@app/services_communications/ats-service/interfaces/match.interface';
import { jobsServicePatterns } from '@app/services_communications/jobs-service';
import { EmailTemplates } from '@app/services_communications/notifier/constants/templates';
import {
  CustomFilters,
  CustomFiltersEnum,
  Experience,
  Filteration,
  Profile,
  Project,
  ServiceName,
  StructuredJob,
  User,
  recentEmailsKey,
} from '@app/shared';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class AtsService {
  constructor(
    @Inject(ATS_CONSTANTS.ATS_JOBS_REDIS_DB_PROVIDER)
    private readonly jobsRedisDB: Redis,
    @Inject(ATS_CONSTANTS.ATS_MAILING_REDIS_DB_PROVIDER)
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

  private _validateCustomFilters(
    jobFilters: CustomFilters,
    profile: any,
  ): boolean {
    for (const filter in jobFilters) {
      if (filter === CustomFiltersEnum.languages) {
        if (
          !jobFilters[filter].every((lang: string) =>
            profile.languages.includes(lang),
          )
        ) {
          return false;
        }
      } else if (
        filter === CustomFiltersEnum.city ||
        filter === CustomFiltersEnum.country ||
        filter === CustomFiltersEnum.graduatedFromCS
      ) {
        if (profile[filter] !== jobFilters[filter]) {
          return false;
        }
      } else if (filter === CustomFiltersEnum.yearsOfExperience) {
        if (profile[filter] < jobFilters[filter]) {
          return false;
        }
      }
    }
    return true;
  }

  private async _getJobs() {
    const jobsString = await this.jobsRedisDB.lrange(
      ATS_CONSTANTS.REDIS_JOBS_KEY,
      0,
      -1,
    );
    const jobs = jobsString.map((job) => JSON.parse(job));

    return jobs;
  }

  private async _deleteJobs() {
    await this.jobsRedisDB.del(ATS_CONSTANTS.REDIS_JOBS_KEY);
  }

  private _calulateMatchedSkills(
    skills: string[],
    jobSkills: string[],
  ): number {
    return skills.filter((skill) =>
      jobSkills.filter(
        (jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill),
      ),
    ).length;
  }

  private _hasWorkedJobTitle(
    experiences: Experience[],
    jobTitle: string,
  ): boolean {
    return experiences.some(
      (experience) =>
        experience.jobTitle.includes(jobTitle) ||
        jobTitle.includes(experience.jobTitle),
    );
  }

  private _calculateMatchedProjectsSkillsScore(
    projects: Project[],
    jobSkills: string[],
  ): number {
    return projects.reduce((acc, project) => {
      return acc + this._calulateMatchedSkills(project.skills, jobSkills);
    }, 0);
  }

  private async _emailExists(email: string): Promise<boolean> {
    const rank = await this.mailingRedisDB.zrank(
      recentEmailsKey,
      JSON.stringify(email),
    );
    return rank !== null;
  }

  private _calculateMatchScore(job: StructuredJob, profile: any): number {
    // we will assume max score for every part of the total score
    // then get the percentage of every part of the part max score
    // each part of the score will take a percentage of the total score
    // then sum all the parts to get the total score

    let matchedSkills = this._calulateMatchedSkills(profile.skills, job.skills);

    matchedSkills =
      matchedSkills > job.skills.length ? job.skills.length : matchedSkills;

    const matchedSkillsScore =
      (matchedSkills / job.skills.length) *
      ATS_CONSTANTS.ATS_MATCHED_SKILLS_WEIGHT;

    // boolean to check if the job title is equal is included in the profile's experiences job titles
    const hasWorkedJobTitle: boolean = this._hasWorkedJobTitle(
      profile.experiences,
      job.title,
    );

    const workedJobTitleScore =
      (hasWorkedJobTitle ? ATS_CONSTANTS.ATS_MAX_WORKED_JOB_TITLE_SCORE : 0) *
      ATS_CONSTANTS.ATS_WORKED_JOB_TITLE_WEIGHT;

    // get the years of experience
    const yearsOfExperience =
      profile.yearsOfExperience >
      ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE
        ? ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE
        : profile.yearsOfExperience;

    const yearsOfExperienceScore =
      (yearsOfExperience / ATS_CONSTANTS.ATS_MAX_YEARS_OF_EXPERIENCE_SCORE) *
      ATS_CONSTANTS.ATS_YEARS_OF_EXPERIENCE_WEIGHT;

    // get title matching score
    let matchedProjectsSkills = this._calculateMatchedProjectsSkillsScore(
      profile.projects,
      job.skills,
    );

    matchedProjectsSkills =
      matchedProjectsSkills >
      ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE
        ? ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE
        : matchedProjectsSkills;

    const matchedProjectsSkillsScore =
      (matchedProjectsSkills /
        ATS_CONSTANTS.ATS_MAX_MATCHED_PROJECTS_SKILLS_SCORE) *
      ATS_CONSTANTS.ATS_MATCHED_PROJECTS_SKILLS_WEIGHT;

    // calculate the total score
    const totalScore =
      matchedSkillsScore +
      workedJobTitleScore +
      yearsOfExperienceScore +
      matchedProjectsSkillsScore;

    return totalScore;
  }

  async match() {
    try {
      // get jobs from REDIS_JOBS_DB Redis DB, and delete them
      const jobs = await this._getJobs();

      if (jobs.length === 0) {
        return {
          status: ATS_CONSTANTS.ATS_NO_JOBS_ERROR,
        };
      }

      await this._deleteJobs();

      let page = 0;
      const take = 200;

      while (true) {
        page++;

        // get all users from Users service
        const users: User[] = await firstValueFrom(
          this.userService.send(
            {
              cmd: userServicePatterns.getAllJobSeekers,
            },
            {
              page,
              take,
            } as PageOptionsDto,
          ),
        );

        if (users.length === 0) break;

        // make set to hold all allowed emails
        const allowedEmails = new Set();
        users.forEach(async (user) => {
          // the emails that are sent to in the last TIME_WINDOW hours/days exist in the mailing DB in this key, and expire after TIME_WINDOW
          const exists = await this._emailExists(user.email);
          if (!exists) allowedEmails.add(user.email);
        });

        // get all profiles of these users from Profiles service
        const profiles = await firstValueFrom(
          this.profileService.send(
            {
              cmd: profileServicePattern.getProfilesByUsersIds,
            },
            {
              usersIds: users.map((user) => user.id),
            },
          ),
        );

        // create a map of users keyed by ID
        const userMap = new Map(users.map((user) => [user.id, user]));

        // map profiles with user details
        const profileUsers = profiles.map((profile: Profile) => {
          const matchedUser = userMap.get(profile.userId);
          return {
            ...profile,
            firstName: matchedUser.firstName,
            lastName: matchedUser.lastName,
            email: matchedUser.email,
            country: matchedUser.country,
            city: matchedUser.city,
          };
        });

        // unique emails, every email with 1 job only, the content is of type AtsEmailTemplateData
        const matchedEmailsContents: { [email: string]: AtsEmailTemplateData } =
          {};

        // will have all matches even if more than job matched the same profile
        const filterations = [];

        jobs.forEach((job) => {
          profileUsers.forEach((profile) => {
            // check if there is custom filters in the job
            if (job.customFilters) {
              // validate custom filters, if no match, continue to the next profile
              const isValid = this._validateCustomFilters(
                job.customFilters,
                profile,
              );

              if (!isValid) {
                return;
              }
            }

            const matchScore = this._calculateMatchScore(job, profile);

            // ATS_CONSTANTS.MATCHING_THRESHOLD is the threshold for matching
            if (matchScore >= ATS_CONSTANTS.MATCHING_THRESHOLD) {
              // don't send matching email to the same email even if 2 profiles with the same mail are matched
              if (allowedEmails.has(profile.email)) {
                if (!matchedEmailsContents[profile.email]) {
                  matchedEmailsContents[profile.email] = {
                    jobTitle: job.title,
                    jobCompany: job.company,
                    jobUrl: job.url,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    matchedJobsCount: 1,
                    matchScore,
                  } as AtsEmailTemplateData;
                } else {
                  // increment the number of matched jobs
                  const newMatchedJobsCount = matchedEmailsContents[
                    profile.email
                  ].matchedJobsCount++;

                  // if the same email is matched with another job, take the job with the highest matchScore
                  if (
                    matchedEmailsContents[profile.email].matchScore < matchScore
                  ) {
                    matchedEmailsContents[profile.email] = {
                      jobTitle: job.title,
                      jobCompany: job.company,
                      jobUrl: job.url,
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      matchScore,
                      matchedJobsCount: newMatchedJobsCount,
                    } as AtsEmailTemplateData;
                  } else {
                    matchedEmailsContents[profile.email].matchedJobsCount =
                      newMatchedJobsCount;
                  }
                }
              }
              filterations.push({
                jobId: job.id,
                profileId: profile.id,
                stageData: {
                  matchScore,
                },
              });
            }
          });
        });

        const matchedEmailsContentsArray = Object.keys(
          matchedEmailsContents,
        ).map((email: string) => {
          return {
            to: email,
            data: matchedEmailsContents[email],
          } as TemplateData;
        });

        const sendEmailsDto: SendEmailsDto = {
          template: EmailTemplates.ATSMATCHED,
          templateData: matchedEmailsContentsArray,
        };

        // send emails to the matched users
        this.notifierService.emit(
          {
            cmd: NotifierEvents.sendEmail,
          },
          sendEmailsDto,
        );

        // add records for these matches (all matches not only the sent emails) in filteration DB
        await this.filterationRepository.save(filterations);
      }

      return {
        status: ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS,
      } as MatchData;
    } catch (error) {
      // TODO: uncomment when fixed
      // throw new RpcException(error)
      return {
        status: ATS_CONSTANTS.ATS_MATCHING_ERROR_STATUS,
        error,
      };
    }
  }

  async matchProfileAndJob(
    profileAndJobDto: ProfileAndJobDto,
  ): Promise<object> {
    try {
      // get job details from Jobs service
      const job: StructuredJob = await firstValueFrom(
        this.jobService.send(
          {
            cmd: jobsServicePatterns.getJobDetailsById,
          },
          profileAndJobDto.jobId,
        ),
      );

      if (!job) {
        return {
          status: ATS_CONSTANTS.ATS_JOB_NOT_FOUND_ERROR,
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
          status: ATS_CONSTANTS.ATS_PROFILE_NOT_FOUND_ERROR,
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
        return {
          status: ATS_CONSTANTS.ATS_USER_NOT_FOUND_ERROR,
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
        isValid = this._validateCustomFilters(
          job.stages.customFilters,
          profileAndUser,
        );
      }

      const matchScore = this._calculateMatchScore(job, profile);

      return {
        status: ATS_CONSTANTS.ATS_MATCHING_DONE_STATUS,
        matchScore,
        isValid,
      } as MatchProfileAndJobData;
    } catch (error) {
      // TODO: uncomment when fixed
      // throw new RpcException(error)
      return {
        status: ATS_CONSTANTS.ATS_MATCHING_ERROR_STATUS,
        error,
      };
    }
  }
}
