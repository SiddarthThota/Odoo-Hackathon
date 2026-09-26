import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OperationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { serializeDecimals } from '../common/prisma-result';
import { calculateAdjustmentDelta } from '../common/domain/operation-state';
import { INVENTORY_CLIENT } from '../inventory-client/inventory-client.token';
import { InventoryClient } from '../inventory-client/inventory.types';
import { AuthUser } from '../common/types/auth-user';
import { CreateAdjustmentDto, AdjustmentQueryDto } from './dto/adjustment.dto';

@Injectable()
export class AdjustmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(INVENTORY_CLIENT) private readonly inventory: InventoryClient,
  ) {}

  async findAll(query: AdjustmentQueryDto) {
    const { page, limit, skip } = this.normalizeQuery(query.page, query.limit);
    const where: Prisma.AdjustmentWhereInput = {};

    if (query.status && ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'].includes(query.status)) {
      where.status = query.status as OperationStatus;
    }
    if (query.productId) where.productId = query.productId;
    if (query.locationId) where.locationId = query.locationId;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.adjustment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adjustment.count({ where }),
    ]);

    return {
      data: serializeDecimals(data),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const adjustment = await this.prisma.adjustment.findUnique({ where: { id } });
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return serializeDecimals(adjustment);
  }

  async create(dto: CreateAdjustmentDto, user: AuthUser) {
    const recordedQty = await this.inventory.getQuantity(dto.productId, dto.locationId);
    const delta = calculateAdjustmentDelta(recordedQty, dto.countedQty);

    const adjustment = await this.prisma.adjustment.create({
      data: {
        productId: dto.productId,
        locationId: dto.locationId,
        recordedQty,
        countedQty: dto.countedQty,
        delta,
        reason: dto.reason,
        status: OperationStatus.DRAFT,
        createdBy: user.sub,
      },
    });

    return serializeDecimals(adjustment);
  }

  async apply(id: string, user: AuthUser) {
    const adjustment = await this.prisma.adjustment.findUnique({ where: { id } });
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    if (adjustment.status !== OperationStatus.DRAFT) {
      throw new ConflictException(`Adjustment cannot be applied from ${adjustment.status} status`);
    }

    const delta = Number(adjustment.delta);
    if (delta !== 0) {
      await this.inventory.adjust(
        adjustment.id,
        adjustment.productId,
        adjustment.locationId,
        delta,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (delta !== 0) {
        await tx.moveHistory.create({
          data: {
            operationType: 'ADJUSTMENT',
            operationId: adjustment.id,
            productId: adjustment.productId,
            quantityDelta: delta,
            fromLocationId: delta < 0 ? adjustment.locationId : null,
            toLocationId: delta > 0 ? adjustment.locationId : null,
            performedBy: user.sub,
          },
        });
      }

      return tx.adjustment.update({
        where: { id: adjustment.id },
        data: {
          status: OperationStatus.DONE,
          appliedAt: new Date(),
          appliedBy: user.sub,
        },
      });
    });

    return serializeDecimals(updated);
  }

  private normalizeQuery(page = 1, limit = 25) {
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 25)));
    return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
  }
}
