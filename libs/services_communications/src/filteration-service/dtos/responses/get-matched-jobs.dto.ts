import { StructuredJob } from "@app/shared";
import { ApiProperty } from "@nestjs/swagger";

export class MatchedJob extends StructuredJob{
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
        description: 'matched jobs',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    matchedJobs: MatchedJob[];

}