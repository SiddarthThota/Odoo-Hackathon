import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('inventory-summary')
  @ApiOperation({ summary: 'Get inventory summary for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary including value, volume, SKUs, and capacity',
  })
  async getInventorySummary() {
    return this.dashboardService.getInventorySummary();
  }

  @Get('stock-status')
  @ApiOperation({ summary: 'Get stock status breakdown for donut chart' })
  @ApiResponse({
    status: 200,
    description: 'Stock status counts (normal, warning, critical)',
  })
  async getStockStatus() {
    return this.dashboardService.getStockStatus();
  }

  @Get('top-inventory-items')
  @ApiOperation({ summary: 'Get top inventory items by quantity' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Top inventory items with quantities and values',
  })
  async getTopInventoryItems(@Query('limit') limit?: number) {
    return this.dashboardService.getTopInventoryItems(
      limit ? Number(limit) : undefined,
    );
  }

  @Get('warehouse-capacity')
  @ApiOperation({ summary: 'Get warehouse capacity overview' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse capacity details and utilization',
  })
  async getWarehouseCapacity() {
    return this.dashboardService.getWarehouseCapacity();
  }
}
