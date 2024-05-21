import { StageType } from "@app/shared/enums/stageType.enum";
import { ApiProperty } from "@nestjs/swagger";

export class GetStageResponseDto {
    @ApiProperty({
        description: 'The stage of the user in the job',
        type: 'string',
        enum: StageType
    })
    stage: StageType;
}