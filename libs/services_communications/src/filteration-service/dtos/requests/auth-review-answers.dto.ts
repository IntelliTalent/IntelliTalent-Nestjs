import { ApiProperty } from "@nestjs/swagger";
import { ReviewAnswersDto } from "./review-answers.dto";
import { IsUUID } from "class-validator";

export class AuthReviewAnswersDto extends ReviewAnswersDto {

    @ApiProperty({
        description: 'the id of the user',
        type: 'UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    userId: string;
}