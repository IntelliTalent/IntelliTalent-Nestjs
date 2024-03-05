import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({})
export class FormField {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({})
  phoneNumber: string;

  @Prop({})
  address: string;

  @Prop({})
  city: string;

  @Prop({})
  country: string;

  @Prop({})
  skills: string[];

  @Prop({})
  portfolio: string;

  @Prop({})
  linkedIn: string;

  @Prop({})
  github: string;

  @Prop({})
  cvLink: string;

  @Prop({})
  postalCode: number;

  @Prop({})
  nationalID: string;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);
