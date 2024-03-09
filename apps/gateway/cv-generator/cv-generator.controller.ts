import { CVResponseDto, cvGeneratorServicePattern } from '@app/services_communications';
import { CurrentUser, ServiceName, User } from '@app/shared';
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
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
  ) {
    return this.cvGeneratorService.send(
      {
        cmd: cvGeneratorServicePattern.generate,
      },
      {
        profileId,
      },
    );
  }

  /**
   * This method gets CV for a profile.
   * The getProfileCV method does the following:
   * - Uses the cvGeneratorService to send a 'getProfileCV' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'Get CV for a profile' })
  @ApiOkResponse({
      description: 'The CV links',
      type: CVResponseDto,
  })
  @Header('content-type', 'application/json')
  @Get('/:profileId')
  async getProfileCV(
    @Param('profileId') profileId: string,
  ) {
    return this.cvGeneratorService.send(
      {
        cmd: cvGeneratorServicePattern.getProfileCV,
      },
      {
        profileId,
      },
    );
  }

  /**
   * This method gets all CVs for a user.
   * The getAllCVs method does the following:
   * - Uses the cvGeneratorService to send a 'getAllCVs' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'Get all CVs for a user' })
  @ApiOkResponse({
      description: 'The CVs links',
      type: CVResponseDto,
      isArray: true,
  })
  @Header('content-type', 'application/json')
  @Get('')
  async getAllCVs(
    @CurrentUser() user: User,
  ) {
    return this.cvGeneratorService.send(
      {
        cmd: cvGeneratorServicePattern.getAllCVs,
      },
      {
        userId: "5454" // TODO: change to user.id,
      },
    );
  }
}
