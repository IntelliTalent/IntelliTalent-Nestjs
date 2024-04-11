import { CVResponseDto, cvGeneratorServicePattern } from '@app/services_communications';
import { CurrentUser, ServiceName, User } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { Controller, Get, Header, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('CV Generator')
@Controller('cvs')
export class ApiCVGeneratorController {
  constructor(
    @Inject(ServiceName.CV_GENERATOR_SERVICE)
    private cvGeneratorService: ClientProxy,
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
  // TODO: Remove
  @Public()
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
  ) {
    const firstName = "Moaz";
    const lastName = "Mohammed";

    const startDate = new Date(2022, 1, 1);
    const endDate = new Date(2024, 1, 1);

    const city = "Cairo";
    const country = "Egypt";

    // TODO: Don't just return, also update record in profile db 
    return this.cvGeneratorService.send(
      {
        cmd: cvGeneratorServicePattern.generate,
      },
      {
        // TODO: get data from profile and user
        profile: {
          fullName: firstName + " " + lastName,
          email: "moaz25jan2015@gmail.com",
          phoneNumber: "+201111111111",
          city,
          country,
          experiences: [
            {
              jobTitle: "Software Engineer",
              companyName: "Intelli Talent",
              description: "Description 1",
              startDate,
              endDate,
            },
            {
              jobTitle: "Backend Engineer",
              companyName: "Google",
              description: "Description 2",
              startDate,
              endDate,
            }
          ],
          skills: ["Python", "Flask", "NodeJS", "ExpressJS"],
          educations: [
            {
              degree: "Bachelor of Computer Science",
              schoolName: "Cairo University",
              description: "Graduated with honors and a GPA of 3.5",
              startDate,
              endDate,
            },
            {
              degree: "Master of Computer Science",
              schoolName: "Cairo University",
              description: "Graduated with honors and a GPA of 3.5",
              startDate,
              endDate,
            },
          ],
          languages: ["English", "Arabic"],
          projects: [
            {
              name: "Project 1",
              description: "Description 1",
              skills: ["Python", "Flask"],
              startDate,
              endDate,
            },
            {
              name: "Project 2",
              description: "Description 2",
              skills: ["NodeJS", "ExpressJS"],
            }
          ],
          certificates: [
            {
              title: "Certificate 1",
              authority: "Authority 1",
              issuedAt: new Date(2022, 1, 1),
              // can be null
              validUntil: new Date(2023, 1, 1),
              url: "https://www.google.com"
            },
            {
              title: "Certificate 2",
              authority: "Authority 2",
              issuedAt: new Date(2022, 1, 1),
              // can be null
              validUntil: new Date(2023, 1, 1),
              url: "https://www.google.com"
            }
          ],
          summary: "I am a software engineer with 5 years of experience in software development.",
          linkedIn: "https://www.linkedin.com",
          gitHub: "https://www.github.com",
        }
      },
    );
  }
}
