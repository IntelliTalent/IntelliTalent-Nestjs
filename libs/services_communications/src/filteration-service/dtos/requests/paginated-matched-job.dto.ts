import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

export class PaginatedMatchedJobDto {
    @ApiProperty({
        description: 'profleId of the applicant',
        type: UUID,
    })
    @IsUUID()
    profileId: string;

    @ApiProperty({
        description: 'userId of the applicant',
        type: UUID,
    })
    @IsUUID()
    userId: string;


    @ApiProperty({
        description: 'page options',
        type: PageOptionsDto,
    })
    paginationOptions: PageOptionsDto;
}