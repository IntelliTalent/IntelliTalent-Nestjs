import { StageType } from "@app/shared/enums/stage-type.enum";
import { ApiProperty } from "@nestjs/swagger";


class AppliedUser {
    @ApiProperty({
        description: 'The id of the profile',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    profileId: string;

    @ApiProperty({
        description: 'The Stage of the user in the job',
        example: 'Interview',
        type: 'string',
        enum: StageType
    })
    stage: StageType;
}


export class GetAppliedUsersResponseDto {

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
        type: [AppliedUser]
    })
    appliedUsers: AppliedUser[];
}