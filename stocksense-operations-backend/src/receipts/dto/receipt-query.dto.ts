import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationStatus } from '@prisma/client';

export class ReceiptQueryDto {
  @IsOptional()
  @IsEnum(OperationStatus)
  status?: OperationStatus;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  search?: string;

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

  @IsOptional()
  @IsString()
  sortBy = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'] as const)
  order: 'asc' | 'desc' = 'desc';
}
