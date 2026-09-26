import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  private readonly allowedSortFields = [
    'name',
    'code',
    'city',
    'capacity',
    'createdAt',
    'updatedAt',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWarehouseDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.warehouse.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_WAREHOUSE_CODE',
        message: `Warehouse with code '${code}' already exists`,
      });
    }

    const warehouse = await this.prisma.warehouse.create({
      data: {
        ...dto,
        code,
        name: dto.name.trim(),
      },
    });

    this.logger.log(`Warehouse created: ${warehouse.code} - ${warehouse.name}`);
    return warehouse;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status === 'active') {
      where.isActive = true;
    } else if (params.status === 'inactive') {
      where.isActive = false;
    }

    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';

    if (params.sortBy && this.allowedSortFields.includes(params.sortBy)) {
      sortBy = params.sortBy;
    }
    if (params.sortOrder === 'asc' || params.sortOrder === 'desc') {
      sortOrder = params.sortOrder;
    }

    const [warehouses, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { locations: true },
          },
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      success: true,
      data: warehouses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { locations: true },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    // Calculate occupancy from stock records
    const stockAgg = await this.prisma.stock.aggregate({
      where: { warehouseId: id },
      _sum: {
        quantity: true,
      },
    });

    const occupied = stockAgg._sum.quantity || 0;
    const available = Math.max(warehouse.capacity - occupied, 0);
    const utilization =
      warehouse.capacity > 0
        ? parseFloat(((occupied / warehouse.capacity) * 100).toFixed(2))
        : 0;

    return {
      ...warehouse,
      locationCount: warehouse._count.locations,
      occupied,
      available,
      utilization,
    };
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    // Validate capacity constraints
    if (dto.capacity !== undefined) {
      const stockAgg = await this.prisma.stock.aggregate({
        where: { warehouseId: id },
        _sum: { quantity: true },
      });

      const currentOccupied = stockAgg._sum.quantity || 0;

      if (dto.capacity < currentOccupied) {
        throw new BadRequestException({
          code: 'CAPACITY_TOO_LOW',
          message: `Cannot set capacity to ${dto.capacity}. Current occupancy is ${currentOccupied}.`,
        });
      }
    }

    // Validate code uniqueness if changing
    if (dto.code && dto.code.trim().toUpperCase() !== warehouse.code) {
      const existing = await this.prisma.warehouse.findUnique({
        where: { code: dto.code.trim().toUpperCase() },
      });

      if (existing) {
        throw new ConflictException({
          code: 'DUPLICATE_WAREHOUSE_CODE',
          message: `Warehouse with code '${dto.code.trim().toUpperCase()}' already exists`,
        });
      }
    }

    const updateData: any = { ...dto };
    if (dto.code) {
      updateData.code = dto.code.trim().toUpperCase();
    }
    if (dto.name) {
      updateData.name = dto.name.trim();
    }

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Warehouse updated: ${updated.code}`);
    return updated;
  }

  async remove(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    // Check if warehouse has stock
    const stockCount = await this.prisma.stock.count({
      where: { warehouseId: id, quantity: { gt: 0 } },
    });

    if (stockCount > 0) {
      // Soft deactivate
      await this.prisma.warehouse.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Warehouse deactivated (has stock): ${warehouse.code}`);
      return { message: 'Warehouse deactivated (has active stock)' };
    }

    await this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Warehouse deactivated: ${warehouse.code}`);
    return { message: 'Warehouse deactivated successfully' };
  }
}
