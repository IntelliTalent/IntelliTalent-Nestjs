import { AUTH_HEADER } from "@app/services_communications";
import { CustomJobPatterns } from "@app/services_communications/custom-job";
import { CreateCustomJobDto } from "@app/services_communications/custom-job/dtos/create-custom-job.dto";
import { Roles, ServiceName, UserType } from "@app/shared";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Custom Job')
@Controller('custom-job')
export class CustomJobController {
    constructor(@Inject(ServiceName.CUSTOM_JOB_SERVICE)
    private customJobService: ClientProxy,) {
    }

    @Post()
    @Roles([UserType.recruiter])
    @ApiBearerAuth(AUTH_HEADER)
    @ApiBody({ type: CreateCustomJobDto, description: 'custom job prompt' })
    @ApiOperation({ summary: 'extract structured job from the prompt' })
    @ApiResponse({
        status: 200,
        description: 'extracted structured job from the prompt successfully',
    })
    async createCustomJob(
        @Body() createCustomJobDto: CreateCustomJobDto,
    ) {
        return this.customJobService.send({ cmd: CustomJobPatterns.createCustomJob }, createCustomJobDto);
    }
}