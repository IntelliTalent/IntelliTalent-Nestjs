import { GenerateCoverLetterDto, userServicePatterns } from '@app/services_communications';
import { CoverLetterResponseDto, coverLetterGeneratorServicePattern } from '@app/services_communications/cover-letter-generator-service';
import { profileServicePattern } from '@app/services_communications/profile/patterns/preofile.patterns';
import { Profile, ServiceName, User } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { Body, Controller, Header, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CoverLetterGeneratorService } from './cover-letter-generator.service';

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
  @Header('content-type', 'application/json')
  @Post('/:profileId')
  async generate(
    @Param('profileId') profileId: string,
    @Body() generateCoverLetterDto: GenerateCoverLetterDto,
  ) {
    return await this.coverLetterGeneratorService.generate(profileId, generateCoverLetterDto);
  }
}
