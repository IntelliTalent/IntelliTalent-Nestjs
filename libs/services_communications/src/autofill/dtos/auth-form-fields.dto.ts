import { ApiProperty } from "@nestjs/swagger";
import { FormFieldsDto } from "./form-fields.dto";
import { IsUUID } from "class-validator";

export class AuthFormFieldsDto extends FormFieldsDto{
    constructor(userId: string, data: {[key: string]: any}) {
        super(data);
        this.userId = userId;
    }
    @ApiProperty({
        type: String,
        description: 'id of the user',
        required: true
    })
    @IsUUID()
    userId: string;
}