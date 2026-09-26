import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'uuid-of-warehouse' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 'A-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Aisle A, Rack 01', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: 'Ground floor storage zone A', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 5000, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}
