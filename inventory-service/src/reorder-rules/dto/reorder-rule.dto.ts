import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateReorderRuleDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'uuid-of-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  minimumStock: number;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  maximumStock: number;

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(1)
  reorderQuantity: number;
}

export class UpdateReorderRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumStock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reorderQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
