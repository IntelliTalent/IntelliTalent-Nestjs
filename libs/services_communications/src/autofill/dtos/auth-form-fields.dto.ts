import { ApiProperty } from "@nestjs/swagger";
import { FormFieldsDto } from "./form-fields.dto";
import { IsUUID } from "class-validator";

export class AuthFormFieldsDto extends FormFieldsDto{
    @ApiProperty({
        type: String,
        description: 'id of the user',
        required: true
    })
    @IsUUID()
    userId: string;
}