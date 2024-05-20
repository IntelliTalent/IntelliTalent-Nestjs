import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FormFieldsDto {
    @ApiProperty({
        type: [Object],
        description: 'Data of the user',
        required: true
    })
    @IsNotEmpty({message: 'Data is required'})
    data: {[key: string]: any};
}