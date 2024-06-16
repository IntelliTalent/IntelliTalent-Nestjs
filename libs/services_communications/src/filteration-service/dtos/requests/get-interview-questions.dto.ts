import { ApiProperty } from "@nestjs/swagger";

export class GetInterviewQuestionsDto{
    userId: string;
    jobId: string;
}