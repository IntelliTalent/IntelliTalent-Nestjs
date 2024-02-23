import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

interface Question {
  question: string;
  answers: string[];
}


@Schema({})
class Quiz {
  @Prop({ required: true, type: Types.UUID })
  profileId: string;

  @Prop({ required: true, type: Types.UUID })
  jobId: string;

  @Prop({ required: true })
  randomSlug: string;

  @Prop({ required: true })
  questions: Question[];

  @Prop({ required: true })
  answers: number[]; // index of the correct answer in the answers array

  @Prop({})
  score: number;

}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
