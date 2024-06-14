import { StructuredJob } from "@app/shared";
import { ApiProperty } from "@nestjs/swagger";

export class AppliedJob extends StructuredJob {
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
        type: 'object',
        properties: {
            count: {
                type: 'number',
                example: 10
            },
            page: {
                type: 'number',
                example: 1
            },
        }
    })
    metadata: {
        count: number;
        page: number;
    };

    @ApiProperty({
        description: 'applied jobs',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    appliedJobs: AppliedJob[];
    
}