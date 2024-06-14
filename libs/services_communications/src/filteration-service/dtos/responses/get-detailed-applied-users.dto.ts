import { Filteration } from "@app/shared";
import { ApiProperty } from "@nestjs/swagger";

export class GetDetailedAppliedUsersDto {
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
        description: 'applied users',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    appliedUsers: Filteration[];
}