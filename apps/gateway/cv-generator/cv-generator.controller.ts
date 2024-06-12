import { CVResponseDto } from '@app/services_communications';
import { Controller, Header, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CVGeneratorService } from './cv-generator.service';
import { CurrentUser, User } from '@app/shared';

@ApiTags('CV Generator')
@Controller('cvs')
export class ApiCVGeneratorController {
  constructor(
    private readonly cvGeneratorService: CVGeneratorService,
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
      description: 'The CV word link',
      type: CVResponseDto,
  })
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
    @CurrentUser() user: User,
  ) {
    return await this.cvGeneratorService.generate(profileId, user);
  }
}
