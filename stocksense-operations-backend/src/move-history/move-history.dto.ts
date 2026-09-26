import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType } from '@prisma/client';

export class MoveHistoryQueryDto {
  @IsOptional()
  @IsEnum(OperationType)
  operationType?: OperationType;

  @IsOptional()
  @IsString()
  operationId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;
}
