import { IsUUID } from "class-validator";

export class InterviewAnswersDto{
    @IsUUID()
    jobId: string;
    @IsUUID()
    profileId: string;
    questions: string[];
    answers: string[];
    recordedAnswers: string[];
}