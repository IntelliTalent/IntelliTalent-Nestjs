import { ApiProperty } from "@nestjs/swagger";

export class UserQuestionsDto {
    @ApiProperty({
        description: 'The list of the questions and the answers of the user',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    example: 'Is ReactJs library or framework?'
                },
                answer: {
                    type: 'string',
                    example: 'What is the reactJs?'
                }
            }
        }
    })
    questions: {
        question: string;
        answer: string;
    }[];
}