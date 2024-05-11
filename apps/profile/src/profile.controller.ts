import { Controller, Get, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { profileServicePattern } from '@app/services_communications/profile/patterns/preofile.patterns';
import {
  CreateProfileDto,
  DeleteProfileDto,
  getUserRepos,
  ResponseScrapGithubProfileDto,
  ScrapeProfile,
  UpdateProfileDto,
} from '@app/services_communications';
import { GithubScrapperService } from './github-scrapper/github-scrapper.service';
import { LinkedinScrapperService } from './linkedin-scrapper/linkedin-scrapper.service';
import { ProfileService } from './profile.service';
import { Profile, RpcExceptionsFilter } from '@app/shared';
import { GetProfilesByUsersIdsDto } from '@app/services_communications/profile/dtos/get-profiles-by-users-ids.dto';

@Controller()
@UseFilters(RpcExceptionsFilter)
export class ProfileController {
  constructor(
    private githubScrapperService: GithubScrapperService,
    private linkedinScrapperService: LinkedinScrapperService,
    private profileService: ProfileService,
  ) {}

  @MessagePattern({ cmd: profileServicePattern.scrapeProfile })
  async scrapeProfile(@Payload() scrapeProfileDto: ScrapeProfile): Promise<{
    githubUserInfo: ResponseScrapGithubProfileDto;
    linkedinUserInfo: Profile;
  }> {
    const { linkedinUserName, githubUserName } = scrapeProfileDto;
    const githubUserInfo =
      await this.githubScrapperService.scrapGithubProfile(githubUserName);
    const linkedinUserInfo =
      await this.linkedinScrapperService.scrapLinkedinProfile(linkedinUserName);
    return { githubUserInfo, linkedinUserInfo };
  }

  @MessagePattern({ cmd: profileServicePattern.getUserRepos })
  async getUserRepos(@Payload() payload: getUserRepos) {
    return this.githubScrapperService.getUserRepos(payload);
  }

  @MessagePattern({ cmd: profileServicePattern.createProfile })
  createProfile(@Payload() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfile })
  updateProfile(@Payload() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(updateProfileDto);
  }

  @MessagePattern({ cmd: profileServicePattern.deleteProfile })
  deleteProfile(@Payload() deleteProfileDto: DeleteProfileDto) {
    return this.profileService.delete(deleteProfileDto);
  }

  @MessagePattern({ cmd: profileServicePattern.getUserProfileCard })
  getUserProfileCard(@Payload() userId: string) {
    return this.profileService.getUserProfileCard(userId);
  }

  @MessagePattern({ cmd: profileServicePattern.getUserProfile })
  getUserProfiles(@Payload() userId: string) {
    return this.profileService.getUserProfiles(userId);
  }

  @MessagePattern({ cmd: profileServicePattern.getProfileById })
  getProfileById(@Payload() profileId: string) {
    return this.profileService.getProfileById(profileId);
  }

  @MessagePattern({ cmd: profileServicePattern.getProfilesByUsersIds })
  getProfilesByUsersIds(@Payload() dto: GetProfilesByUsersIdsDto) {
    return this.profileService.getProfilesByUsersIds(dto.usersIds);
  }
}
