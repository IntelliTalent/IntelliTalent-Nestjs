import { ApiProperty } from "@nestjs/swagger";

export class FilterJobRequestDto {
    @ApiProperty({
        description: 'the id of the job',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    jobId: string;
}