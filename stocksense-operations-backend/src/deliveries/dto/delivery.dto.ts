import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryLineDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0)
  expectedQty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQty?: number;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;
}

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  customerRef!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DeliveryLineDto)
  lines!: DeliveryLineDto[];
}

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerRef?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  warehouseId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DeliveryLineDto)
  lines?: DeliveryLineDto[];
}
