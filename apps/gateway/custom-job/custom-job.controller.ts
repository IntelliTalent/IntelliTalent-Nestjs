import { AUTH_HEADER } from '@app/services_communications';
import { CreateCustomJobDto } from '@app/services_communications/custom-job-service/dtos/requests/create-custom-job.dto';
import { CustomJobResponseDto } from '@app/services_communications/custom-job-service/dtos/responses/custom-job-response.dto';
import { CreateCustomJobServicePattern } from '@app/services_communications/custom-job-service/patterns/create-custom-job-service.pattern';
import { Roles, ServiceName, UserType } from '@app/shared';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('bearer')
@ApiTags('Custom Job Generator')
@ApiBearerAuth(AUTH_HEADER)
@Roles([UserType.jobSeeker])
@Controller('custom-job')
export class ApiCustomJobController {
  constructor(
    @Inject(ServiceName.CUSTOM_JOB_SERVICE)
    private customJobService: ClientProxy,
  ) { }

  @ApiOperation({ summary: 'Create Custom Job from its prompt' })
  @Post()
  @ApiOkResponse({
    type: CustomJobResponseDto,
    description: 'The generated custom job',
  })
  async createCustomJob(
    @Body() createCustomJobDto: CreateCustomJobDto,
  ) {
    console.log('createCustomJobDto', createCustomJobDto);
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
