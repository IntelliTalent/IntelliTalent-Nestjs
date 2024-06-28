import { IJobs } from "@app/services_communications/jobs-service";
import { StructuredJob } from "@app/shared";
import { PageMetaDto } from "@app/shared/api-features/dtos/page-meta.dto";
import { ApiProperty } from "@nestjs/swagger";

export class MatchedJob extends IJobs {
    @ApiProperty({
        description: 'Match score of the ATS',
        type: 'number',
        example: 0.8
    })
    matchScore: number;
}


export class GetMatchedJobsDto {
    @ApiProperty({
        description: 'Metadata of the response',
        type: PageMetaDto,
    })
    metadata: PageMetaDto

    @ApiProperty({
        description: 'matched jobs',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    matchedJobs: MatchedJob[];

}
