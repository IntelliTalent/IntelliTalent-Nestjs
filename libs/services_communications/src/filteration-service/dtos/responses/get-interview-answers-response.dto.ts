import { ApiProperty } from "@nestjs/swagger";

export class GetInterviewAnswersResponse {
    @ApiProperty({
        description: 'the questions of the interview',
        type: 'array',
        items: {
            type: 'string',
        }
    })
    questions: string[];

    @ApiProperty({
        description: 'the answers of the interview',
        type: 'array',
        items: {
            type: 'string',
        }
    })
    answers: string[];

    @ApiProperty({
        description: 'the reqcorded answers of the interview',
        type: 'array',
        items: {
            type: 'string',
        }
    })
    recordedAnswers: string[];

}