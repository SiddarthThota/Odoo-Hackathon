import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReorderRuleDto, UpdateReorderRuleDto } from './dto';

@Injectable()
export class ReorderRulesService {
  private readonly logger = new Logger(ReorderRulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReorderRuleDto) {
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

    // Check for duplicate rule
    const existing = await this.prisma.reorderRule.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_REORDER_RULE',
        message: 'A reorder rule already exists for this product-warehouse combination',
      });
    }

    // Validate minimum < maximum
    if (dto.minimumStock >= dto.maximumStock) {
      throw new BadRequestException({
        code: 'INVALID_STOCK_LEVELS',
        message: 'Minimum stock must be less than maximum stock',
      });
    }

    const rule = await this.prisma.reorderRule.create({
      data: dto,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });

    this.logger.log(
      `Reorder rule created for ${product.sku} at ${warehouse.code}`,
    );
    return rule;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    productId?: string;
    warehouseId?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) where.productId = params.productId;
    if (params.warehouseId) where.warehouseId = params.warehouseId;

    if (params.status === 'active') {
      where.isActive = true;
    } else if (params.status === 'inactive') {
      where.isActive = false;
    }

    const [rules, total] = await Promise.all([
      this.prisma.reorderRule.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { id: true, sku: true, name: true, category: true } },
          warehouse: { select: { id: true, code: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reorderRule.count({ where }),
    ]);

    return {
      success: true,
      data: rules,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const rule = await this.prisma.reorderRule.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, sku: true, name: true, category: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });

    if (!rule) {
      throw new NotFoundException({
        code: 'REORDER_RULE_NOT_FOUND',
        message: 'Reorder rule not found',
      });
    }

    return rule;
  }

  async update(id: string, dto: UpdateReorderRuleDto) {
    const rule = await this.prisma.reorderRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException({
        code: 'REORDER_RULE_NOT_FOUND',
        message: 'Reorder rule not found',
      });
    }

    // Validate stock levels if both are provided
    const minStock = dto.minimumStock ?? rule.minimumStock;
    const maxStock = dto.maximumStock ?? rule.maximumStock;

    if (minStock >= maxStock) {
      throw new BadRequestException({
        code: 'INVALID_STOCK_LEVELS',
        message: 'Minimum stock must be less than maximum stock',
      });
    }

    const updated = await this.prisma.reorderRule.update({
      where: { id },
      data: dto,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });

    this.logger.log(`Reorder rule updated: ${id}`);
    return updated;
  }

  async remove(id: string) {
    const rule = await this.prisma.reorderRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException({
        code: 'REORDER_RULE_NOT_FOUND',
        message: 'Reorder rule not found',
      });
    }

    await this.prisma.reorderRule.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Reorder rule deactivated: ${id}`);
    return { message: 'Reorder rule deactivated successfully' };
  }
}
