import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { OperationStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @IsNumber()
  @Min(0)
  countedQty!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdjustmentQueryDto {
  @IsOptional()
  @IsEnum(OperationStatus)
  status?: OperationStatus;

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
