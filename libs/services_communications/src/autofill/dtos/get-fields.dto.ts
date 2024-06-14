import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GetFieldsDto {

    @ApiProperty({
        type: String,
        description: 'id of the user',
        required: true
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        type: [String],
        description: 'fields to get',
        required: true
    })
    fields: [string];

}