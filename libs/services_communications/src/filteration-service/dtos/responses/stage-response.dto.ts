import { StageData } from "@app/shared/entities/filteration.entity";
import { StageType } from "@app/shared/enums/stage-type.enum";
import { StageType as JobStageType } from "@app/shared/entities/structured_jobs.entity";
import { ApiProperty } from "@nestjs/swagger";

export class StageResponseDto {
    @ApiProperty({
        description: 'The message of the response',
        type: 'string',
    })
    message: string;

    @ApiProperty({
        description: 'The stage of the user in the job',
        type: 'string',
        enum: StageType
    })
    stage: StageType | JobStageType;

    @ApiProperty({
        description: 'The data of the stage',
        type: 'object',
    })
    stageData?: StageData;
}