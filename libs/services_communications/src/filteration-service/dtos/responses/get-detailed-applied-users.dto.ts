import { Filteration } from "@app/shared";
import { PageMetaDto } from "@app/shared/api-features/dtos/page-meta.dto";
import { ApiProperty } from "@nestjs/swagger";

export class GetDetailedAppliedUsersDto {
    @ApiProperty({
        description: 'Metadata of the response',
        type: PageMetaDto
    })
    metadata: PageMetaDto;

    @ApiProperty({
        description: 'applied users',
        type: 'array',
        items: {
            type: 'object',
        }
    })
    appliedUsers: Filteration[];
}