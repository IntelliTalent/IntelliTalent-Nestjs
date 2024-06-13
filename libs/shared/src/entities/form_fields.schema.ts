import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({})
export class FormField {
  @Prop({
    unique: true,
    required: true
  })
  userId: string;
  @Prop({
    required: false,
    type: Map,
  })
  data: Map<string, string>;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);
