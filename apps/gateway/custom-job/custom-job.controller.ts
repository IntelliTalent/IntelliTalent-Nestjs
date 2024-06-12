import { CustomJobPatterns } from "@app/services_communications/custom-job";
import { CreateCustomJobDto } from "@app/services_communications/custom-job/dtos/create-custom-job.dto";
import { Roles, ServiceName, UserType } from "@app/shared";
import { Body, Controller,  Inject, Post } from "@nestjs/common";
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
        return this.customJobService.send({ cmd: CustomJobPatterns.createCustomJob }, createCustomJobDto);
    }
}