import { IsUUID } from "class-validator";
import { QuizDto } from "./quiz.dto";

export class AuthQuizDto extends QuizDto {
    @IsUUID()
    userId: string;
}