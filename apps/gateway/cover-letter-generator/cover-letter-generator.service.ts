import { GenerateCoverLetterDto, coverLetterGeneratorServicePattern, profileServicePattern, userServicePatterns } from "@app/services_communications";
import { CoverLetterGenerateDto } from "@app/services_communications/cover-letter-generator-service/dtos/cover-letter-generate-command.dto";
import { Profile, ServiceName, User } from "@app/shared";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Observable, firstValueFrom } from "rxjs";

@Injectable()
export class CoverLetterGeneratorService {
  constructor(
    @Inject(ServiceName.COVER_LETTER_GENERATOR_SERVICE)
    private coverLetterGeneratorService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private profileService: ClientProxy,
  ) {}
  public async generate(profileId: string, generateCoverLetterDto: GenerateCoverLetterDto, user: User): Promise<any> {
    const profile: Profile = await firstValueFrom(
        this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      )
    );

    const profileAndUser = {
      ...profile,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email,
      address: user.address,
      phoneNumber: user.phoneNumber,
    };

    const coverLetterGenerateDto: CoverLetterGenerateDto = {
      profile: profileAndUser,
      jobTitle: generateCoverLetterDto.jobTitle,
      companyName: generateCoverLetterDto.companyName,
    }

    return await firstValueFrom(
      this.coverLetterGeneratorService.send(
        {
          cmd: coverLetterGeneratorServicePattern.generate,
        },
        coverLetterGenerateDto,
      )
    );
  }
}
