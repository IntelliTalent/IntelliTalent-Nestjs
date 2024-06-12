import { JobPlace, JobType } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';

export class IJobs {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  jobLocation: string;

  @ApiProperty({ enum: JobType })
  type: JobType;

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty()
  url: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: Date })
  publishedAt: Date;

  @ApiProperty({ enum: JobPlace })
  jobPlace: JobPlace;

  @ApiProperty({ required: false })
  neededExperience?: number;

  @ApiProperty({ required: false })
  education?: string;

  @ApiProperty({ required: false })
  csRequired?: boolean;

  @ApiProperty()
  isActive: boolean;
}
