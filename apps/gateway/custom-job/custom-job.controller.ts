import { CreateCustomJobDto } from "@app/services_communications/custom-job/dtos/create-custom-job.dto";
import { Roles, ServiceName, User, UserType } from "@app/shared";
import { Public } from "@app/shared/decorators/ispublic-decorator.decorator";
import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Custom Job')
@Controller('custom-job')
export class CustomJobController {
    constructor(@Inject(ServiceName.CUSTOM_JOB_SERVICE)
    private customJobService: ClientProxy,) {
    }

    @Post()
    @Roles([UserType.recruiter])
    async getCustomJobs(
        @Body() createCustomJobDto: CreateCustomJobDto,
    ) {
        return this.customJobService.send({ cmd: 'createCustomJob' }, createCustomJobDto);
    }
}