import { GenerateCoverLetterDto } from '@app/services_communications';
import { CoverLetterResponseDto } from '@app/services_communications/cover-letter-generator-service';
import { Body, Controller, Header, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoverLetterGeneratorService } from './cover-letter-generator.service';
import { CurrentUser, User } from '@app/shared';

@ApiTags('Cover Letter Generator')
@Controller('coverLetters')
export class ApiCoverLetterGeneratorController {
  constructor(
    private readonly coverLetterGeneratorService: CoverLetterGeneratorService,
  ) {}

  /**
   * This method generates cover letter for a profile.
   * The generate method does the following:
   * - Uses the coverLetterGeneratorService to send a 'generate' command as payload to the microservice.
   *
   * @returns An the command response.
   */
  @ApiOperation({ summary: 'Generate cover letter for a profile' })
  @ApiOkResponse({
      description: 'The cover letter word link and content',
      type: CoverLetterResponseDto,
  })
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
    @Body() generateCoverLetterDto: GenerateCoverLetterDto,
    @CurrentUser() user: User,
  ) {
    return await this.coverLetterGeneratorService.generate(profileId, generateCoverLetterDto, user);
  }
}
