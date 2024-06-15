import { ApiProperty } from "@nestjs/swagger";

export class GetInterviewQuestionsResponse{
    @ApiProperty({
        description: 'Questions to be asked in the interview',
        example: [
            'what is your exprerience in this field?',
            'what is your previous job?',
            'what is your previous salary?'
        ]
    })
    questions: string[];
}