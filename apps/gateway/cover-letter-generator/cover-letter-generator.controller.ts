import { GenerateCoverLetterDto, userServicePatterns } from '@app/services_communications';
import { CoverLetterResponseDto, coverLetterGeneratorServicePattern } from '@app/services_communications/cover-letter-generator-service';
import { profileServicePattern } from '@app/services_communications/profile/patterns/preofile.patterns';
import { Profile, ServiceName, User } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { Body, Controller, Header, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Cover Letter Generator')
@Controller('coverLetters')
export class ApiCoverLetterGeneratorController {
  constructor(
    @Inject(ServiceName.COVER_LETTER_GENERATOR_SERVICE)
    private coverLetterGeneratorService: ClientProxy,
    @Inject(ServiceName.PROFILE_SERVICE)
    private profileService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE)
    private userService: ClientProxy,
  ) {}

  /**
   * This method generates cover letter for a profile.
   * The generate method does the following:
   * - Uses the coverLetterGeneratorService to send a 'generate' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'Generate cover letter for a profile' })
  @ApiOkResponse({
      description: 'The cover letter links and content',
      type: CoverLetterResponseDto,
  })
  @Header('content-type', 'application/json')
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
    @Body() generateCoverLetterDto: GenerateCoverLetterDto,
  ) {
    console.log('Generating cover letter for profile:', profileId);

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
    };

    return this.coverLetterGeneratorService.send(
      {
        cmd: coverLetterGeneratorServicePattern.generate,
      },
      {
        profile: profileAndUser,
        jobTitle: generateCoverLetterDto.jobTitle,
        companyName: generateCoverLetterDto.companyName,
      }
    );
  }
}
