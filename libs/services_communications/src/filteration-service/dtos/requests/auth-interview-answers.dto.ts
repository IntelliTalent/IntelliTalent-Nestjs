import { IsUUID } from "class-validator";
import { InterviewAnswersDto } from "./interview-answers.dto";

export class AuthInterviewAnswersDto extends InterviewAnswersDto {
    @IsUUID()
    userId: string;
}