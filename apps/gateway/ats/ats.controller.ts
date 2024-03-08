import { atsServicePattern } from '@app/services_communications/ats-service';
import { ServiceName, User } from '@app/shared';
import {
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

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
  @Post('match')
  async match() {
    return this.atsService.send(
      {
        cmd: atsServicePattern.match,
      },
      {},
    );
  }
}
