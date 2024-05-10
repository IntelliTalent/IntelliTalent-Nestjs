import { UpdateProfileDto, cvGeneratorServicePattern, profileServicePattern, userServicePatterns } from "@app/services_communications";
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
    @Inject(ServiceName.USER_SERVICE)
    private userService: ClientProxy,
  ) {}
  public async generate(profileId: string): Promise<any> {
    console.log('Generating CV for profile:', profileId);
    
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
      city: user.city,
      country: user.country,
    };

    const response = await firstValueFrom(
      this.cvGeneratorService.send(
        {
          cmd: cvGeneratorServicePattern.generate,
        },
        {
          profile: profileAndUser,
        },
      )
    );

    const cv: string = response.word

    const updateProfileDto: UpdateProfileDto = {
      profileId: profile.id,
      userId: user.id,
      cv,
    }

    const updatedProfile: Profile = await firstValueFrom(
      this.profileService.send(
        { cmd: profileServicePattern.updateProfile },
        updateProfileDto,
      )
    );

    console.log("updatedProfile", updatedProfile);

    return response;
  }
}
