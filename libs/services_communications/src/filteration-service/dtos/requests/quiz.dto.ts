import { IsNumber, IsUUID, Max, Min } from "class-validator";

export class QuizDto {
    @IsUUID()
    jobId: string;
    @IsUUID()
    profileId: string;
    @IsNumber()
    @Min(0)
    @Max(100)
    grade: number;
}