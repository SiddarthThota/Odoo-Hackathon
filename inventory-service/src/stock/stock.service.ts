import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  StockOperationDto,
  StockTransferDto,
  StockReserveDto,
} from './dto';

export type StockStatus = 'NORMAL' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCK';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  private readonly allowedSortFields = [
    'quantity',
    'availableQuantity',
    'reservedQuantity',
    'createdAt',
    'updatedAt',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List stock with full filtering, pagination, search, and sorting.
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    productId?: string;
    warehouseId?: string;
    locationId?: string;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) where.productId = params.productId;
    if (params.warehouseId) where.warehouseId = params.warehouseId;
    if (params.locationId) where.locationId = params.locationId;

    if (params.category) {
      where.product = {
        category: { equals: params.category, mode: 'insensitive' },
      };
    }

    if (params.search) {
      where.product = {
        ...where.product,
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    // Stock status filter
    if (params.status === 'out_of_stock') {
      where.availableQuantity = 0;
    } else if (params.status === 'low') {
      where.quantity = { gt: 0 };
      // Will be filtered post-query for reorderLevel comparison
    }

    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';

    if (params.sortBy && this.allowedSortFields.includes(params.sortBy)) {
      sortBy = params.sortBy;
    }
    if (params.sortOrder === 'asc' || params.sortOrder === 'desc') {
      sortOrder = params.sortOrder;
    }

    const [stocks, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              category: true,
              unit: true,
              price: true,
              cost: true,
              reorderLevel: true,
              reorderQuantity: true,
            },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
          location: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      this.prisma.stock.count({ where }),
    ]);

    // Enrich with status
    const enrichedStocks = stocks.map((stock) => ({
      ...stock,
      status: this.calculateStockStatus(
        stock.quantity,
        stock.availableQuantity,
        stock.product.reorderLevel,
      ),
    }));

    return {
      success: true,
      data: enrichedStocks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
            price: true,
            cost: true,
            reorderLevel: true,
          },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
        location: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!stock) {
      throw new NotFoundException({
        code: 'STOCK_NOT_FOUND',
        message: 'Stock record not found',
      });
    }

    return {
      ...stock,
      status: this.calculateStockStatus(
        stock.quantity,
        stock.availableQuantity,
        stock.product.reorderLevel,
      ),
    };
  }

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    const stocks = await this.prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: {
          select: { id: true, code: true, name: true },
        },
        location: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return stocks.map((stock) => ({
      ...stock,
      status: this.calculateStockStatus(
        stock.quantity,
        stock.availableQuantity,
        product.reorderLevel,
      ),
    }));
  }

  async findByWarehouse(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    const stocks = await this.prisma.stock.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
            reorderLevel: true,
          },
        },
        location: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return stocks.map((stock) => ({
      ...stock,
      status: this.calculateStockStatus(
        stock.quantity,
        stock.availableQuantity,
        stock.product.reorderLevel,
      ),
    }));
  }

  async findByLocation(locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      });
    }

    const stocks = await this.prisma.stock.findMany({
      where: { locationId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
            reorderLevel: true,
          },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return stocks.map((stock) => ({
      ...stock,
      status: this.calculateStockStatus(
        stock.quantity,
        stock.availableQuantity,
        stock.product.reorderLevel,
      ),
    }));
  }

  /**
   * Get low stock items: products at or below their reorder level.
   */
  async getLowStock(params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Find stocks where quantity is above 0 but at or below the product's reorder level
    const stocks = await this.prisma.$queryRaw<any[]>`
      SELECT s.*, 
             p.sku as "productSku", p.name as "productName", p.category as "productCategory",
             p.unit as "productUnit", p.reorder_level as "reorderLevel",
             w.code as "warehouseCode", w.name as "warehouseName",
             l.code as "locationCode", l.name as "locationName"
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      JOIN warehouses w ON s.warehouse_id = w.id
      JOIN locations l ON s.location_id = l.id
      WHERE s.quantity > 0 AND s.quantity <= p.reorder_level AND p.reorder_level > 0
      ORDER BY s.quantity ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countResult = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count
      FROM stocks s
      JOIN products p ON s.product_id = p.id
      WHERE s.quantity > 0 AND s.quantity <= p.reorder_level AND p.reorder_level > 0
    `;

    const total = countResult[0]?.count || 0;

    const enrichedStocks = stocks.map((s) => ({
      id: s.id,
      productId: s.product_id,
      warehouseId: s.warehouse_id,
      locationId: s.location_id,
      quantity: s.quantity,
      reservedQuantity: s.reserved_quantity,
      availableQuantity: s.available_quantity,
      status: 'LOW' as StockStatus,
      product: {
        sku: s.productSku,
        name: s.productName,
        category: s.productCategory,
        unit: s.productUnit,
        reorderLevel: s.reorderLevel,
      },
      warehouse: { code: s.warehouseCode, name: s.warehouseName },
      location: { code: s.locationCode, name: s.locationName },
    }));

    return {
      success: true,
      data: enrichedStocks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get out of stock items: available quantity is 0.
   */
  async getOutOfStock(params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where = { availableQuantity: 0 };

    const [stocks, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              category: true,
              unit: true,
              reorderLevel: true,
            },
          },
          warehouse: { select: { id: true, code: true, name: true } },
          location: { select: { id: true, code: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.stock.count({ where }),
    ]);

    return {
      success: true,
      data: stocks.map((s) => ({ ...s, status: 'OUT_OF_STOCK' as StockStatus })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ────────────────────────────────────────────
  // Internal Stock Operations
  // ────────────────────────────────────────────

  async increaseStock(dto: StockOperationDto) {
    await this.validateStockOperation(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert: create stock record if it doesn't exist, or increment
      const existing = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            locationId: dto.locationId,
          },
        },
      });

      if (existing) {
        return tx.stock.update({
          where: { id: existing.id },
          data: {
            quantity: { increment: dto.quantity },
            availableQuantity: { increment: dto.quantity },
          },
          include: {
            product: { select: { sku: true, name: true } },
            warehouse: { select: { code: true, name: true } },
            location: { select: { code: true } },
          },
        });
      } else {
        return tx.stock.create({
          data: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            locationId: dto.locationId,
            quantity: dto.quantity,
            reservedQuantity: 0,
            availableQuantity: dto.quantity,
          },
          include: {
            product: { select: { sku: true, name: true } },
            warehouse: { select: { code: true, name: true } },
            location: { select: { code: true } },
          },
        });
      }
    });

    this.logger.log(
      `Stock increased: +${dto.quantity} for product ${result.product.sku} at ${result.warehouse.code}/${result.location.code}`,
    );

    return result;
  }

  async decreaseStock(dto: StockOperationDto) {
    await this.validateStockOperation(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            locationId: dto.locationId,
          },
        },
      });

      if (!stock) {
        throw new NotFoundException({
          code: 'STOCK_NOT_FOUND',
          message: 'No stock record found for this product at the specified location',
        });
      }

      if (stock.availableQuantity < dto.quantity) {
        throw new ConflictException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient available stock. Available: ${stock.availableQuantity}, Requested: ${dto.quantity}`,
        });
      }

      return tx.stock.update({
        where: { id: stock.id },
        data: {
          quantity: { decrement: dto.quantity },
          availableQuantity: { decrement: dto.quantity },
        },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
          location: { select: { code: true } },
        },
      });
    });

    this.logger.log(
      `Stock decreased: -${dto.quantity} for product ${result.product.sku} at ${result.warehouse.code}/${result.location.code}`,
    );

    return result;
  }

  async reserveStock(dto: StockReserveDto) {
    await this.validateStockOperation(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            locationId: dto.locationId,
          },
        },
      });

      if (!stock) {
        throw new NotFoundException({
          code: 'STOCK_NOT_FOUND',
          message: 'No stock record found for this product at the specified location',
        });
      }

      if (stock.availableQuantity < dto.quantity) {
        throw new ConflictException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient available stock for reservation. Available: ${stock.availableQuantity}, Requested: ${dto.quantity}`,
        });
      }

      return tx.stock.update({
        where: { id: stock.id },
        data: {
          reservedQuantity: { increment: dto.quantity },
          availableQuantity: { decrement: dto.quantity },
        },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
          location: { select: { code: true } },
        },
      });
    });

    this.logger.log(
      `Stock reserved: ${dto.quantity} units for product ${result.product.sku}`,
    );

    return result;
  }

  async releaseStock(dto: StockReserveDto) {
    await this.validateStockOperation(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            locationId: dto.locationId,
          },
        },
      });

      if (!stock) {
        throw new NotFoundException({
          code: 'STOCK_NOT_FOUND',
          message: 'No stock record found for this product at the specified location',
        });
      }

      if (stock.reservedQuantity < dto.quantity) {
        throw new ConflictException({
          code: 'INSUFFICIENT_RESERVATION',
          message: `Cannot release ${dto.quantity} units. Only ${stock.reservedQuantity} reserved.`,
        });
      }

      return tx.stock.update({
        where: { id: stock.id },
        data: {
          reservedQuantity: { decrement: dto.quantity },
          availableQuantity: { increment: dto.quantity },
        },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
          location: { select: { code: true } },
        },
      });
    });

    this.logger.log(
      `Stock released: ${dto.quantity} units for product ${result.product.sku}`,
    );

    return result;
  }

  async transferStock(dto: StockTransferDto) {
    // Validate source
    await this.validateStockOperation({
      productId: dto.productId,
      warehouseId: dto.sourceWarehouseId,
      locationId: dto.sourceLocationId,
      quantity: dto.quantity,
    });

    // Validate destination
    await this.validateStockOperation({
      productId: dto.productId,
      warehouseId: dto.destinationWarehouseId,
      locationId: dto.destinationLocationId,
      quantity: dto.quantity,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      // Decrease from source
      const sourceStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.sourceWarehouseId,
            locationId: dto.sourceLocationId,
          },
        },
      });

      if (!sourceStock) {
        throw new NotFoundException({
          code: 'SOURCE_STOCK_NOT_FOUND',
          message: 'No stock record at source location',
        });
      }

      if (sourceStock.availableQuantity < dto.quantity) {
        throw new ConflictException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock at source. Available: ${sourceStock.availableQuantity}, Requested: ${dto.quantity}`,
        });
      }

      // Decrease source
      const updatedSource = await tx.stock.update({
        where: { id: sourceStock.id },
        data: {
          quantity: { decrement: dto.quantity },
          availableQuantity: { decrement: dto.quantity },
        },
      });

      // Increase destination (upsert)
      const existingDest = await tx.stock.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId: dto.productId,
            warehouseId: dto.destinationWarehouseId,
            locationId: dto.destinationLocationId,
          },
        },
      });

      let updatedDest;
      if (existingDest) {
        updatedDest = await tx.stock.update({
          where: { id: existingDest.id },
          data: {
            quantity: { increment: dto.quantity },
            availableQuantity: { increment: dto.quantity },
          },
        });
      } else {
        updatedDest = await tx.stock.create({
          data: {
            productId: dto.productId,
            warehouseId: dto.destinationWarehouseId,
            locationId: dto.destinationLocationId,
            quantity: dto.quantity,
            reservedQuantity: 0,
            availableQuantity: dto.quantity,
          },
        });
      }

      return { source: updatedSource, destination: updatedDest };
    });

    this.logger.log(
      `Stock transferred: ${dto.quantity} units from ${dto.sourceWarehouseId}/${dto.sourceLocationId} to ${dto.destinationWarehouseId}/${dto.destinationLocationId}`,
    );

    return result;
  }

  // ────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────

  private calculateStockStatus(
    quantity: number,
    availableQuantity: number,
    reorderLevel: number,
  ): StockStatus {
    if (quantity === 0 || availableQuantity === 0) return 'OUT_OF_STOCK';
    if (reorderLevel > 0 && quantity <= reorderLevel) return 'LOW';
    return 'NORMAL';
  }

  private async validateStockOperation(
    dto: Pick<StockOperationDto, 'productId' | 'warehouseId' | 'locationId' | 'quantity'>,
  ) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    // Validate warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: dto.locationId },
    });
    if (!location) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      });
    }

    // Validate location belongs to warehouse
    if (location.warehouseId !== dto.warehouseId) {
      throw new BadRequestException({
        code: 'LOCATION_WAREHOUSE_MISMATCH',
        message: 'Location does not belong to the specified warehouse',
      });
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException({
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be greater than 0',
      });
    }
  }
}
