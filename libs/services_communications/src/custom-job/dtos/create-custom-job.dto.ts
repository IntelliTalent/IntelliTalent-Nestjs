import { IsNotEmpty, IsString } from "class-validator";

export class CreateCustomJobDto {
    @IsString()
    @IsNotEmpty()
    jobPrompt: string;
}