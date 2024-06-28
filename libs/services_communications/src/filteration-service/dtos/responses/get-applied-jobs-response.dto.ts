import { IJobs } from "@app/services_communications/jobs-service";
import { StructuredJob } from "@app/shared";
import { PageMetaDto } from "@app/shared/api-features/dtos/page-meta.dto";
import { ApiProperty } from "@nestjs/swagger";

export class AppliedJob extends IJobs {
    @ApiProperty({
        description: 'the current stage of the user',
        example: 'Applied'
    })
    applicationCurrentStage: string;

    @ApiProperty({
        description: 'is the user qualified for the job',
        example: true
    })
    isQualified: boolean;
}

export class GetAppliedJobsDto {
    @ApiProperty({
        description: 'Metadata of the response',
        type: PageMetaDto
    })
    metadata: PageMetaDto

    @ApiProperty({
        description: 'applied jobs',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    appliedJobs: AppliedJob[];

}
