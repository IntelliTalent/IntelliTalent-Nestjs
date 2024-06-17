import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class ApplyJobRequest {

    @ApiProperty({
        description: 'the id of the user',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    profileId: string;


    @ApiProperty({
        description: 'the id of the job',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    jobId: string;
}