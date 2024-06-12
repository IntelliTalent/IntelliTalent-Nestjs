import { UpdateProfileDto, cvGeneratorServicePattern, profileServicePattern, userServicePatterns } from "@app/services_communications";
import { CVGenerateDto } from "@app/services_communications/cv-generator-service/dtos/cv-generate-command.dto";
import { CVGeneratorProfileAndUserData } from "@app/services_communications/cv-generator-service/dtos/cv-generator-profile-and-user.dto";
import { Profile, ServiceName, User } from "@app/shared";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CVGeneratorService {
  constructor(
    @Inject(ServiceName.CV_GENERATOR_SERVICE)
    private cvGeneratorService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private profileService: ClientProxy,
  ) {}
  public async generate(profileId: string, user: User): Promise<any> {
    const profile: Profile = await firstValueFrom(
        this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      )
    );

    const profileAndUser: CVGeneratorProfileAndUserData = {
      ...profile,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email,
      address: user.address,
      phoneNumber: user.phoneNumber,
      city: user.city,
      country: user.country,
    };

    const cvGenerateDto: CVGenerateDto = {
      profile: profileAndUser,
    }

    const response = await firstValueFrom(
      this.cvGeneratorService.send(
        {
          cmd: cvGeneratorServicePattern.generate,
        },
        cvGenerateDto,
      )
    );

    const cv: string = response.word

    const updateProfileDto: UpdateProfileDto = {
      profileId: profile.id,
      userId: user.id,
      cv,
    }
    
    this.profileService.emit(
      { cmd: profileServicePattern.updateProfile },
      updateProfileDto,
    );

    return response;
  }
}
