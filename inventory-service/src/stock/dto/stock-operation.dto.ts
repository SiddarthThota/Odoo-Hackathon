import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';

export class StockOperationDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'uuid-of-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 'uuid-of-location' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class StockTransferDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'uuid-of-source-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  sourceWarehouseId: string;

  @ApiProperty({ example: 'uuid-of-source-location' })
  @IsUUID()
  @IsNotEmpty()
  sourceLocationId: string;

  @ApiProperty({ example: 'uuid-of-destination-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  destinationWarehouseId: string;

  @ApiProperty({ example: 'uuid-of-destination-location' })
  @IsUUID()
  @IsNotEmpty()
  destinationLocationId: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class StockReserveDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'uuid-of-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 'uuid-of-location' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(1)
  quantity: number;
}
