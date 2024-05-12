import { atsServicePattern } from '@app/services_communications/ats-service';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';
import { ServiceName } from '@app/shared';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import {
  Body,
  Controller,
  Header,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ATS')
@Controller('ats')
export class ApiATSController {
  constructor(
    @Inject(ServiceName.ATS_SERVICE) private atsService: ClientProxy,
  ) {}

  /**
   * This method matches new jobs in DB with current users.
   * The match method does the following:
   * - Uses the atsService to send a 'match' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'For testing ATS service' })
  @Header('content-type', 'application/json')
  @Public()
  @Post('match')
  async match() {
    this.atsService.emit(
      {
        cmd: atsServicePattern.match,
      },
      {},
    );

    return { message: 'Matching started' }
  }

  /**
   * This method matches a job in DB with a profile.
   * The match method does the following:
   * - Uses the atsService to send a 'matchProfileAndJob' command as payload to the microservice.
   *
   * @returns An Observable of the command response.
   */
  @ApiOperation({ summary: 'For testing ATS service' })
  @Header('content-type', 'application/json')
  @Public()
  @Post('matchProfileAndJob')
  async matchProfileAndJob(@Body() profileAndJobDto: ProfileAndJobDto) {
    return this.atsService.send(
      {
        cmd: atsServicePattern.matchProfileAndJob,
      },
      profileAndJobDto,
    );
  }
}
