import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateLimitDto {
  @ApiPropertyOptional({
    required: false,
    description: 'The end date',
  })
  @IsOptional({})
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    required: false,
    description: 'The end date',
  })
  @IsDateString()
  @IsOptional({})
  endDate?: Date;
}
