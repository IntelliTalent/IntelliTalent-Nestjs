import { ApiProperty } from "@nestjs/swagger";

export class GetInterviewAnswersDto {
    @ApiProperty({
        description: 'the user id',
        type: 'uuid',
        example: 'c3e4c0e4-0e1e-4b1e-8c1e-3e4c0e4c0e4c'
    })
    userId: string;
    @ApiProperty({
        description: 'the profile id',
        type: 'uuid',
        example: 'c3e4c0e4-0e1e-4b1e-8c1e-3e4c0e4c0e4c'
    })
    profileId: string;
    @ApiProperty({
        description: 'the job id',
        type: 'uuid',
        example: 'c3e4c0e4-0e1e-4b1e-8c1e-3e4c0e4c0e4c'
    })
    jobId: string;

}