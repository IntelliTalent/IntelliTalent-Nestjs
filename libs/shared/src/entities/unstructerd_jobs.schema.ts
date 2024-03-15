import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum JobType {
  FullTime = 'Full Time',
  PartTime = 'Part Time',
  Contract = 'Contract',
  Internship = 'Internship',
  Temporary = 'Temporary',
  Volunteer = 'Volunteer',
  Other = 'Other',
}

export enum JobPlace {
  Remote = 'Remote',
  OnSite = 'On Site',
  Hybrid = 'Hybrid',
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class UnstructuredJobs {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  jobLocation: string;

  @Prop({ required: true, enum: JobType })
  type: JobType;

  @Prop({ type: [String] })
  skills: string[];

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  description: string;

  @Prop({ })
  // format is "YYYY-MM-DD"
  publishedAt: string;

  @Prop({ required: true, default: Date.now() })
  scrappedAt: Date;

  @Prop({})
  jobPlace: JobPlace;

  @Prop({})
  numberOfApplicants: number;

  @Prop({})
  neededExperience: number;

  @Prop({})
  education: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UnstructuredJobsSchema = SchemaFactory.createForClass(UnstructuredJobs);

// Create unique compound index on title, company, and publishedAt fields
UnstructuredJobsSchema.index({ title: 1, company: 1, publishedAt: 1 }, { unique: true });
