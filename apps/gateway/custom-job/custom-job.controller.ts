import { CreateCustomJobDto } from '@app/services_communications/custom-job-service/dtos/requests/create-custom-job.dto';
import { CustomJobResponseDto } from '@app/services_communications/custom-job-service/dtos/responses/custom-job-response.dto';
import { CreateCustomJobServicePattern } from '@app/services_communications/custom-job-service/patterns/create-custom-job-service.pattern';
import { ServiceName } from '@app/shared';
import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('bearer')
@ApiTags('Custom Job Generator')
@Controller('custom-job')
export class ApiCustomJobController {
  constructor(
    @Inject(ServiceName.CUSTOM_JOB_SERVICE)
    private customJobService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Create Custom Job from its prompt' })
  @Post()
  @ApiOkResponse({
    type: CustomJobResponseDto,
    description: 'The generated custom job',
  })
  async createCustomJob(
    @Body() createCustomJobDto: CreateCustomJobDto,
  ) {
    return this.customJobService.send(
      {
        cmd: CreateCustomJobServicePattern.create,
      },
      {
        jobPrompt: createCustomJobDto.jobPrompt,
      },
    );
  }
}
