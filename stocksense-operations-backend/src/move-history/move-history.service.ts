import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, OperationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { serializeDecimals } from '../common/prisma-result';
import { MoveHistoryQueryDto } from './move-history.dto';

@Injectable()
export class MoveHistoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: MoveHistoryQueryDto) {
    const { page, limit, skip } =
      this.normalizeQuery(
        query.page,
        query.limit,
      );

    const where: Prisma.MoveHistoryWhereInput = {};

    if (query.operationType) {
      where.operationType =
        query.operationType;
    }

    if (query.operationId) {
      where.operationId =
        query.operationId;
    }

    if (query.productId) {
      where.productId =
        query.productId;
    }

    if (query.locationId) {
      where.OR = [
        {
          fromLocationId:
            query.locationId,
        },
        {
          toLocationId:
            query.locationId,
        },
      ];
    }

    if (query.from || query.to) {
      where.occurredAt = {
        ...(query.from
          ? {
              gte: new Date(
                query.from,
              ),
            }
          : {}),
        ...(query.to
          ? {
              lte: new Date(
                query.to,
              ),
            }
          : {}),
      };
    }

    const [
      data,
      total,
    ] = await this.prisma.$transaction([
      this.prisma.moveHistory.findMany({
        where,
        orderBy: {
          occurredAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.moveHistory.count({
        where,
      }),
    ]);

    return {
      data: serializeDecimals(data),
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const item =
      await this.prisma.moveHistory.findUnique({
        where: {
          id,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Move history entry not found',
      );
    }

    return serializeDecimals(item);
  }

  private normalizeQuery(
    page = 1,
    limit = 25,
  ) {
    const safePage = Math.max(
      1,
      Math.floor(
        Number(page) || 1,
      ),
    );

    const safeLimit = Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          Number(limit) || 25,
        ),
      ),
    );

    return {
      page: safePage,
      limit: safeLimit,
      skip:
        (safePage - 1) *
        safeLimit,
    };
  }
}