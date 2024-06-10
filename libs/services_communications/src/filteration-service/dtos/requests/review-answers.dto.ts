import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsUUID, Max, Min } from "class-validator";

export class ReviewAnswersDto {


    @ApiProperty({
        description: 'the id of the job',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    jobId: string;

    @ApiProperty({
        description: 'the id of the profile',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    profileId: string;
    
    @ApiProperty({
        description: 'the answers of the quiz',
        type: 'array',
        example: [100, 90, 80]
    })
    @IsArray()
    @Type(() => Number)
    @Min(0, { each: true })
    @Max(100, { each: true })
    grades: number[];
}