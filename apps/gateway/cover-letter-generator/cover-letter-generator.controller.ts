import { GenerateCoverLetterDto } from '@app/services_communications';
import { coverLetterGeneratorServicePattern } from '@app/services_communications/cover-letter-generator-service';
import { ServiceName } from '@app/shared';
import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cover Letter Generator')
@Controller('coverLetters')
export class ApiCoverLetterGeneratorController {
  constructor(
    @Inject(ServiceName.COVER_LETTER_SERVICE) private coverLetterGeneratorService: ClientProxy,
  ) {}

  /**
   * This method generates cover letter for a profile.
   * The generate method does the following:
   * - Uses the coverLetterGeneratorService to send a 'generate' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @Post('/:profileId')
  async generate(@Param('profileId') profileId: string, @Body() generateCoverLetterDto: GenerateCoverLetterDto ) {
    return this.coverLetterGeneratorService.send(
      {
        cmd: coverLetterGeneratorServicePattern.generate,
      },
      {
        profileId,
        jobTitle: generateCoverLetterDto.jobTitle,
        companyName: generateCoverLetterDto.companyName, 
      },
    );
  }
}
