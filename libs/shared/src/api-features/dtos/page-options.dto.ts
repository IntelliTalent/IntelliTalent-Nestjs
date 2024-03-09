import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotIn,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Order } from '../constant/order.enum';

const excludedSearchFields = ['createdAt', 'updatedAt', 'deletedAt'];

export class PageOptionsDto {
  @ApiPropertyOptional({
    required: false,
    description: 'Field to order by its formed by entity.fieldName',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsOptional()
  @IsEnum(Order)
  orderDirection: Order = Order.DESC;

  @ApiPropertyOptional({
    required: false,
    description: 'Field to search by its formed by entity.fieldName',
  })
  @IsOptional()
  @IsString()
  @IsNotIn(excludedSearchFields)
  searchField?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Value to search for',
  })
  @IsOptional()
  @IsString()
  searchValue?: string;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 200,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly take?: number = 10;

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

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
