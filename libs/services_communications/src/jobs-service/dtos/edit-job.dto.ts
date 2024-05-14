import { ApiProperty } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class EditJobDto extends CreateJobDto {
  jobId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
