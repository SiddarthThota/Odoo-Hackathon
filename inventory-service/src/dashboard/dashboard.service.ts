import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/v1/dashboard/inventory-summary
   * Returns total inventory value, volume, active SKUs, and warehouse capacity.
   */
  async getInventorySummary() {
    const [
      stockAgg,
      activeProducts,
      warehouseAgg,
      inventoryValue,
    ] = await Promise.all([
      // Total inventory volume
      this.prisma.stock.aggregate({
        _sum: { quantity: true },
      }),
      // Active SKUs count
      this.prisma.product.count({ where: { isActive: true } }),
      // Warehouse capacity
      this.prisma.warehouse.aggregate({
        where: { isActive: true },
        _sum: { capacity: true },
      }),
      // Total inventory value (sum of stock.quantity * product.price)
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT COALESCE(SUM(s.quantity * p.price), 0)::float as total
        FROM stocks s
        JOIN products p ON s.product_id = p.id
      `,
    ]);

    const totalCapacity = warehouseAgg._sum.capacity || 0;
    const totalOccupied = stockAgg._sum.quantity || 0;

    return {
      totalInventoryValue: inventoryValue[0]?.total || 0,
      inventoryVolume: totalOccupied,
      activeSkus: activeProducts,
      warehouseCapacity: {
        occupied: totalOccupied,
        total: totalCapacity,
        percentage:
          totalCapacity > 0
            ? parseFloat(((totalOccupied / totalCapacity) * 100).toFixed(2))
            : 0,
      },
    };
  }

  /**
   * GET /api/v1/dashboard/stock-status
   * Returns stock status breakdown for the donut chart.
   */
  async getStockStatus() {
    // Get all stocks with their product reorder levels
    const stocks = await this.prisma.stock.findMany({
      include: {
        product: { select: { reorderLevel: true } },
      },
    });

    let normal = 0;
    let warning = 0;
    let critical = 0;

    for (const stock of stocks) {
      if (stock.quantity === 0 || stock.availableQuantity === 0) {
        critical++;
      } else if (
        stock.product.reorderLevel > 0 &&
        stock.quantity <= stock.product.reorderLevel
      ) {
        warning++;
      } else {
        normal++;
      }
    }

    return {
      totalSkus: stocks.length,
      normal,
      warning,
      critical,
    };
  }

  /**
   * GET /api/v1/dashboard/top-inventory-items
   * Returns top products by quantity.
   */
  async getTopInventoryItems(limit: number = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const topItems = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.category,
        p.unit,
        p.price,
        COALESCE(SUM(s.quantity), 0)::int as "totalQuantity",
        COALESCE(SUM(s.available_quantity), 0)::int as "availableQuantity",
        COALESCE(SUM(s.reserved_quantity), 0)::int as "reservedQuantity",
        COALESCE(SUM(s.quantity * p.price), 0)::float as "totalValue",
        (
          SELECT w.name FROM warehouses w 
          JOIN stocks s2 ON s2.warehouse_id = w.id 
          WHERE s2.product_id = p.id 
          GROUP BY w.id, w.name 
          ORDER BY SUM(s2.quantity) DESC 
          LIMIT 1
        ) as "primaryWarehouse"
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id, p.sku, p.name, p.category, p.unit, p.price
      ORDER BY "totalQuantity" DESC
      LIMIT ${safeLimit}
    `;

    return topItems;
  }

  /**
   * GET /api/v1/dashboard/warehouse-capacity
   * Returns capacity information for all active warehouses.
   */
  async getWarehouseCapacity() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        capacity: true,
      },
    });

    const warehouseCapacities = await Promise.all(
      warehouses.map(async (wh) => {
        const stockAgg = await this.prisma.stock.aggregate({
          where: { warehouseId: wh.id },
          _sum: { quantity: true },
        });

        const occupied = stockAgg._sum.quantity || 0;
        const available = Math.max(wh.capacity - occupied, 0);
        const utilization =
          wh.capacity > 0
            ? parseFloat(((occupied / wh.capacity) * 100).toFixed(2))
            : 0;

        return {
          id: wh.id,
          code: wh.code,
          name: wh.name,
          capacity: wh.capacity,
          occupied,
          available,
          utilization,
        };
      }),
    );

    // Overall totals
    const totalCapacity = warehouseCapacities.reduce((sum, wh) => sum + wh.capacity, 0);
    const totalOccupied = warehouseCapacities.reduce((sum, wh) => sum + wh.occupied, 0);
    const totalAvailable = warehouseCapacities.reduce((sum, wh) => sum + wh.available, 0);

    return {
      total: {
        capacity: totalCapacity,
        occupied: totalOccupied,
        available: totalAvailable,
        utilization:
          totalCapacity > 0
            ? parseFloat(((totalOccupied / totalCapacity) * 100).toFixed(2))
            : 0,
      },
      warehouses: warehouseCapacities,
    };
  }
}
