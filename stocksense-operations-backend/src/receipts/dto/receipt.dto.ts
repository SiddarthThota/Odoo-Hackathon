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

export class ReceiptLineDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0)
  expectedQty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  receivedQty?: number;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;
}

export class CreateReceiptDto {
  @IsString()
  @IsNotEmpty()
  supplierRef!: string;

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
  @Type(() => ReceiptLineDto)
  lines!: ReceiptLineDto[];
}

export class UpdateReceiptDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  supplierRef?: string;

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
  @Type(() => ReceiptLineDto)
  lines?: ReceiptLineDto[];
}
