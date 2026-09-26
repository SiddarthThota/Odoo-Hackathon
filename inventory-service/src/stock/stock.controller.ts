import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import {
  StockOperationDto,
  StockTransferDto,
  StockReserveDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Stock')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // ────────────────────────────────────────────
  // Public Stock Read Endpoints
  // ────────────────────────────────────────────

  @Get('stock')
  @ApiOperation({ summary: 'List stock with pagination, search, filtering, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'locationId', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['normal', 'low', 'out_of_stock', 'overstock'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('locationId') locationId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.stockService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      productId,
      warehouseId,
      locationId,
      category,
      status,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get('stock/low')
  @ApiOperation({ summary: 'Get low stock items (below reorder level)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLowStock(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockService.getLowStock({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('stock/out-of-stock')
  @ApiOperation({ summary: 'Get out of stock items (available = 0)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getOutOfStock(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockService.getOutOfStock({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('stock/:id')
  @ApiOperation({ summary: 'Get stock record by ID' })
  @ApiResponse({ status: 200, description: 'Stock record found' })
  @ApiResponse({ status: 404, description: 'Stock record not found' })
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Get('products/:id/stock')
  @ApiOperation({ summary: 'Get stock for a specific product' })
  async getProductStock(@Param('id') id: string) {
    return this.stockService.findByProduct(id);
  }

  @Get('warehouses/:id/stock')
  @ApiOperation({ summary: 'Get stock for a specific warehouse' })
  async getWarehouseStock(@Param('id') id: string) {
    return this.stockService.findByWarehouse(id);
  }

  @Get('locations/:id/stock')
  @ApiOperation({ summary: 'Get stock for a specific location' })
  async getLocationStock(@Param('id') id: string) {
    return this.stockService.findByLocation(id);
  }

  // ────────────────────────────────────────────
  // Internal Stock Operations (Service-to-Service)
  // ────────────────────────────────────────────

  @Post('internal/stock/increase')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Increase stock quantity' })
  @ApiResponse({ status: 200, description: 'Stock increased' })
  @ApiResponse({ status: 404, description: 'Product/Warehouse/Location not found' })
  async increaseStock(@Body() dto: StockOperationDto) {
    return this.stockService.increaseStock(dto);
  }

  @Post('internal/stock/decrease')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Decrease stock quantity' })
  @ApiResponse({ status: 200, description: 'Stock decreased' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async decreaseStock(@Body() dto: StockOperationDto) {
    return this.stockService.decreaseStock(dto);
  }

  @Post('internal/stock/reserve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Reserve stock' })
  @ApiResponse({ status: 200, description: 'Stock reserved' })
  @ApiResponse({ status: 409, description: 'Insufficient stock for reservation' })
  async reserveStock(@Body() dto: StockReserveDto) {
    return this.stockService.reserveStock(dto);
  }

  @Post('internal/stock/release')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Release reserved stock' })
  @ApiResponse({ status: 200, description: 'Stock released' })
  @ApiResponse({ status: 409, description: 'Insufficient reservation' })
  async releaseStock(@Body() dto: StockReserveDto) {
    return this.stockService.releaseStock(dto);
  }

  @Post('internal/stock/transfer')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Transfer stock between locations' })
  @ApiResponse({ status: 200, description: 'Stock transferred' })
  @ApiResponse({ status: 409, description: 'Insufficient stock at source' })
  async transferStock(@Body() dto: StockTransferDto) {
    return this.stockService.transferStock(dto);
  }
}
