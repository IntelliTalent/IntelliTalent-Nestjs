import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsUUID } from "class-validator";
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
        description: 'page number',
        type: Number,
    })
    page: number;

    @ApiProperty({
        description: 'limit of the page',
        type: Number,
    })
    limit: number;
}