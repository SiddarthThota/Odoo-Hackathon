import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from './dto';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  private readonly allowedSortFields = [
    'code',
    'name',
    'capacity',
    'createdAt',
    'updatedAt',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLocationDto) {
    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException({
        code: 'WAREHOUSE_NOT_FOUND',
        message: 'Warehouse not found',
      });
    }

    const code = dto.code.trim().toUpperCase();

    // Check unique constraint: warehouseId + code
    const existing = await this.prisma.location.findUnique({
      where: {
        warehouseId_code: {
          warehouseId: dto.warehouseId,
          code,
        },
      },
    });

    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_LOCATION_CODE',
        message: `Location with code '${code}' already exists in this warehouse`,
      });
    }

    const location = await this.prisma.location.create({
      data: {
        ...dto,
        code,
      },
      include: {
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    this.logger.log(
      `Location created: ${location.code} in warehouse ${warehouse.code}`,
    );
    return location;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    warehouseId?: string;
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
        { code: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
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

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          warehouse: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      success: true,
      data: locations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      });
    }

    // Get stock summary for this location
    const stockAgg = await this.prisma.stock.aggregate({
      where: { locationId: id },
      _sum: {
        quantity: true,
        reservedQuantity: true,
        availableQuantity: true,
      },
    });

    return {
      ...location,
      stock: {
        onHand: stockAgg._sum.quantity || 0,
        reserved: stockAgg._sum.reservedQuantity || 0,
        available: stockAgg._sum.availableQuantity || 0,
      },
    };
  }

  async update(id: string, dto: UpdateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      });
    }

    // Validate code uniqueness if changing
    if (dto.code && dto.code.trim().toUpperCase() !== location.code) {
      const existing = await this.prisma.location.findUnique({
        where: {
          warehouseId_code: {
            warehouseId: location.warehouseId,
            code: dto.code.trim().toUpperCase(),
          },
        },
      });

      if (existing) {
        throw new ConflictException({
          code: 'DUPLICATE_LOCATION_CODE',
          message: `Location with code '${dto.code.trim().toUpperCase()}' already exists in this warehouse`,
        });
      }
    }

    const updateData: any = { ...dto };
    if (dto.code) {
      updateData.code = dto.code.trim().toUpperCase();
    }

    const updated = await this.prisma.location.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    this.logger.log(`Location updated: ${updated.code}`);
    return updated;
  }

  async remove(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      });
    }

    // Soft delete
    await this.prisma.location.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Location deactivated: ${location.code}`);
    return { message: 'Location deactivated successfully' };
  }
}
