import { GenerateCoverLetterDto } from '@app/services_communications';
import { CoverLetterResponseDto, coverLetterGeneratorServicePattern } from '@app/services_communications/cover-letter-generator-service';
import { ServiceName } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { Body, Controller, Header, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cover Letter Generator')
@Controller('coverLetters')
export class ApiCoverLetterGeneratorController {
  constructor(
    @Inject(ServiceName.COVER_LETTER_GENERATOR_SERVICE)
    private coverLetterGeneratorService: ClientProxy,
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
  // TODO: Remove
  @Public()
  @Header('content-type', 'application/json')
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
    @Body() generateCoverLetterDto: GenerateCoverLetterDto,
  ) {
    const firstName = "Moaz";
    const lastName = "Mohammed";

    const startDate = new Date(2022, 1, 1);
    const endDate = new Date(2024, 1, 1);
    var companyExperienceYears = endDate.getFullYear() - startDate.getFullYear();

    companyExperienceYears = companyExperienceYears > 1 ? companyExperienceYears : 1;

    return this.coverLetterGeneratorService.send(
      {
        cmd: coverLetterGeneratorServicePattern.generate,
      },
      {
        // TODO: get data from profile and user
        profile: {
          fullName: firstName + " " + lastName,
          email: "moaz25jan2015@gmail.com",
          address: "Cairo, Egypt",
          phoneNumber: "+201111111111",
          yearsOfExperience: 5,
          experiences: [
            {
              jobTitle: "Software Engineer",
              companyName: "Intelli Talent",
              companyExperienceYears,
            },
            {
              jobTitle: "Backend Engineer",
              companyName: "Google",
              companyExperienceYears: companyExperienceYears + 2,
            }
          ],
          skills: ["Python", "Flask", "NodeJS", "ExpressJS"],
        },
        jobTitle: generateCoverLetterDto.jobTitle,
        companyName: generateCoverLetterDto.companyName,
      },
    );
  }
}
