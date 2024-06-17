import { ApiProperty } from "@nestjs/swagger";
import { ApplyJobRequest } from "./apply-job-request.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class AuthApplyJobRequestDto extends ApplyJobRequest {

    @ApiProperty({
        description: 'the id of the user',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'the email of the user',
        type: 'string',
        example: 'mohamed@gmail.com'
    })
    @IsOptional()
    @IsEmail()
    email?: string;

}