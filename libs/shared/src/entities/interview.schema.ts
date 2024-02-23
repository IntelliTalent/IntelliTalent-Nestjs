import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({})
class Interview {
  @Prop({ required: true, type: Types.UUID })
  profileId: string;

  @Prop({ required: true, type: Types.UUID })
  jobId: string;

  @Prop({ required: true })
  randomSlug: string;

  @Prop({})
  textAnswers: string[];

  @Prop({})
  recordedAnswers: string[];

  @Prop({ required: true })
  questions: string[];
}


export const InterviewSchema = SchemaFactory.createForClass(Interview);