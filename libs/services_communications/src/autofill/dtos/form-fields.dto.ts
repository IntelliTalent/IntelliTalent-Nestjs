import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FormFieldsDto {
    constructor(data: {[key: string]: any}) {
        this.data = data;
    }
    
    @ApiProperty({
        type: [Object],
        description: 'Data of the user',
        required: true
    })
    @IsNotEmpty({message: 'Data is required'})
    data: {[key: string]: any};
}