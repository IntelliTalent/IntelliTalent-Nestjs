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
              description: "Worked on a project that helped to increase company's revenue by 20% in 6 months.",
              startDate: new Date(2022, 7, 15),
            },
            {
              jobTitle: "Backend Engineer",
              companyName: "Google",
              description: "Improved the performance of the backend by 30% in 3 months.",
              startDate: new Date(2020, 1, 1),
              endDate: new Date(2022, 7, 1),
            }
          ],
          skills: ["Python", "Flask", "NodeJS", "ExpressJS"],
          educations: [
            {
              degree: "Master of Computer Science",
              schoolName: "University of Engineering and Technology, Lahore",
              description: "Graduated with honors and a GPA of 3.5",
              startDate: new Date(2022, 9, 1)
            },
            {
              degree: "Bachelor of Science in Computer Science",
              schoolName: "University of Engineering and Technology, Lahore",
              description: "Graduated with honors and a GPA of 3.5",
              startDate: new Date(2018, 9, 1),
              endDate: new Date(2022, 5, 1)
            },
          ],
          languages: ["English", "Arabic"],
          projects: [
            {
              name: "Intelli Talent",
              description: "Intelli Talent is a platform that helps companies to hire the best talents, devloped as microservices.",
              skills: ["Python", "Flask", "NestJS", "TypeORM", "PostgreSQL", "Docker"],
              startDate,
              endDate,
            },
            {
              name: "Push Sender",
              description: "It's a project that sends push notifications to users using FCM and APN APIs.",
              skills: ["NodeJS", "ExpressJS", "MongoDB"],
            }
          ],
          certificates: [
            {
              title: "AWS Cloud Practitioner Certificate",
              authority: "AWS",
              issuedAt: new Date(2022, 1, 1),
              url: "https://www.google.com"
            },
            {
              title: "Graduation Certificate",
              authority: "Cairo University",
              issuedAt: new Date(2022, 7, 1),
              validUntil: new Date(2028, 10, 1),
              url: "https://www.youtube.com"
            }
          ],
          summary: "I'm a software engineer with a passion for learning and teaching. I'm currently looking for a full-time software engineering position.",
          linkedIn: "https://www.linkedin.com",
          gitHub: "https://www.github.com",
        }
      },
    );
  }
}
