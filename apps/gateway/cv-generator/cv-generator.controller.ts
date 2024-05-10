import { CVResponseDto, cvGeneratorServicePattern, profileServicePattern, userServicePatterns } from '@app/services_communications';
import { Profile, ServiceName, User } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { Controller, Get, Header, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('CV Generator')
@Controller('cvs')
export class ApiCVGeneratorController {
  constructor(
    @Inject(ServiceName.CV_GENERATOR_SERVICE)
    private cvGeneratorService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private profileService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE)
    private userService: ClientProxy,
  ) {}

  /**
   * This method generates CV for a profile.
   * The generate method does the following:
   * - Uses the cvGeneratorService to send a 'generate' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'Generate CV for a profile' })
  @ApiOkResponse({
      description: 'The CV links',
      type: CVResponseDto,
  })
  @Header('content-type', 'application/json')
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
  ) {
    console.log('Generating CV for profile:', profileId);
    
    const profile: Profile = await firstValueFrom(
        this.profileService.send(
        {
          cmd: profileServicePattern.getProfileById,
        },
        profileId,
      )
    );

    console.log('profile', profile);

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

    // TODO: Don't just return, also update record in profile db 
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

    console.log('response', response);

    return response;
  }
}
