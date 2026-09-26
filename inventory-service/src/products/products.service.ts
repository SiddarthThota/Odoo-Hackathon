import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  private readonly allowedSortFields = [
    'name',
    'sku',
    'category',
    'price',
    'cost',
    'createdAt',
    'updatedAt',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const sku = dto.sku.trim().toUpperCase();

    const existing = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existing) {
      throw new ConflictException({
        code: 'DUPLICATE_SKU',
        message: `Product with SKU '${sku}' already exists`,
      });
    }

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        sku,
        name: dto.name.trim(),
        category: dto.category.trim(),
        unit: dto.unit.trim().toUpperCase(),
      },
    });

    this.logger.log(`Product created: ${product.sku} - ${product.name}`);
    return product;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
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
        { sku: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.category) {
      where.category = { equals: params.category, mode: 'insensitive' };
    }

    if (params.status === 'active') {
      where.isActive = true;
    } else if (params.status === 'inactive') {
      where.isActive = false;
    }

    // Safe sorting
    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';

    if (params.sortBy && this.allowedSortFields.includes(params.sortBy)) {
      sortBy = params.sortBy;
    }
    if (params.sortOrder === 'asc' || params.sortOrder === 'desc') {
      sortOrder = params.sortOrder;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    // Get aggregated stock data
    const stockAgg = await this.prisma.stock.aggregate({
      where: { productId: id },
      _sum: {
        quantity: true,
        reservedQuantity: true,
        availableQuantity: true,
      },
    });

    return {
      ...product,
      stock: {
        onHand: stockAgg._sum.quantity || 0,
        reserved: stockAgg._sum.reservedQuantity || 0,
        available: stockAgg._sum.availableQuantity || 0,
      },
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    // If SKU is being changed, validate uniqueness
    if (dto.sku && dto.sku.trim().toUpperCase() !== product.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: dto.sku.trim().toUpperCase() },
      });

      if (existingSku) {
        throw new ConflictException({
          code: 'DUPLICATE_SKU',
          message: `Product with SKU '${dto.sku.trim().toUpperCase()}' already exists`,
        });
      }
    }

    const updateData: any = { ...dto };
    if (dto.sku) {
      updateData.sku = dto.sku.trim().toUpperCase();
    }
    if (dto.name) {
      updateData.name = dto.name.trim();
    }
    if (dto.category) {
      updateData.category = dto.category.trim();
    }
    if (dto.unit) {
      updateData.unit = dto.unit.trim().toUpperCase();
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Product updated: ${updated.sku}`);
    return updated;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    // Check if product has stock - soft delete
    const stockCount = await this.prisma.stock.count({
      where: { productId: id },
    });

    if (stockCount > 0) {
      // Soft delete
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Product deactivated (has stock): ${product.sku}`);
      return { message: 'Product deactivated (has existing stock records)' };
    }

    // Hard delete if no stock
    await this.prisma.product.delete({ where: { id } });
    this.logger.log(`Product deleted: ${product.sku}`);
    return { message: 'Product deleted successfully' };
  }
}
