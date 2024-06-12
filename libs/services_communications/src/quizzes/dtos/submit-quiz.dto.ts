import { QuizIdentifierDto } from './get-quiz.dto';
import { IsArray, IsInt, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto extends QuizIdentifierDto {
  @ApiProperty({ type: [Number], description: 'Array of user answers' })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(0, { each: true })
  userAnswers: number[];
}
