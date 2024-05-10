import { GenerateCoverLetterDto, coverLetterGeneratorServicePattern, profileServicePattern, userServicePatterns } from "@app/services_communications";
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
    @Inject(ServiceName.USER_SERVICE)
    private userService: ClientProxy,
  ) {}
  public async generate(profileId: string, generateCoverLetterDto: GenerateCoverLetterDto): Promise<any> {
    console.log('Generating cover letter for profile:', profileId);

    const profile: Profile = await firstValueFrom(
        this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      )
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

    const profileAndUser = {
      ...profile,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email,
      address: user.address,
      phoneNumber: user.phoneNumber,
    };

    return await firstValueFrom(
      this.coverLetterGeneratorService.send(
        {
          cmd: coverLetterGeneratorServicePattern.generate,
        },
        {
          profile: profileAndUser,
          jobTitle: generateCoverLetterDto.jobTitle,
          companyName: generateCoverLetterDto.companyName,
        }
      )
    );
  }
}
