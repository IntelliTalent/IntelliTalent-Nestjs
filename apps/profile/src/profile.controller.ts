import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern } from '@nestjs/microservices';
import { profileServicePattern } from '@app/services_communications/profile/patterns/preofile.patterns';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getHello(): string {
    return this.profileService.getHello();
  }

  @MessagePattern({ cmd: profileServicePattern.createProfile })
  createProfile(data: any) {
    return { id: 1, name: 'John Doe', email: 'john@example.com' };
  }

  @MessagePattern({ cmd: profileServicePattern.getuserProfile })
  getuserProfile(data: any) {
    return { id: 1, name: 'John Doe', email: 'waer@gmail.com' };
  }

  @MessagePattern({ cmd: profileServicePattern.getProfileById })
  getProfileById(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.getuserProfileCard })
  getuserProfileCard(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.getuserProfileNames })
  getuserProfileNames(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateUserProfile })
  updateUserProfile(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfilePersonalInfo })
  updateProfilePersonalInfo(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileExperience })
  updateProfileExperience(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileEducation })
  updateProfileEducation(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileSkills })
  updateProfileSkills(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileCertifications })
  updateProfileCertifications(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileLanguages })
  updateProfileLanguages(data: any) {
    return { id: 1, name: 'John Doe' };
  }

  @MessagePattern({ cmd: profileServicePattern.updateProfileProjects })
  updateProfileProjects(data: any) {
    return { id: 1, name: 'John Doe' };
  }
}
