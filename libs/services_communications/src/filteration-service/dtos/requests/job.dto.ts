import { StageType } from "@app/shared/entities/structured_jobs.entity";
import { ApiProperty } from "@nestjs/swagger";

export class JobDto {
    @ApiProperty({
        description: 'the id of the job',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    jobId: string;

    @ApiProperty({
        description: 'the previous stage of the job',
        type: 'string',
        example: 'quiz'
    })
    previousStage: StageType;
}