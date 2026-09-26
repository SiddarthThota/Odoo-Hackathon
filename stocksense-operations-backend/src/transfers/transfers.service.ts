import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OperationStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ReferenceGeneratorService } from '../common/reference-generator.service';
import { serializeDecimals } from '../common/prisma-result';
import { INVENTORY_CLIENT } from '../inventory-client/inventory-client.token';
import { InventoryClient } from '../inventory-client/inventory.types';
import { AuthUser } from '../common/types/auth-user';
import {
  CreateTransferDto,
  TransferQueryDto,
} from './dto/transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly references: ReferenceGeneratorService,
    @Inject(INVENTORY_CLIENT)
    private readonly inventory: InventoryClient,
  ) {}

  async findAll(query: TransferQueryDto) {
    const { page, limit, skip } = this.normalizeQuery(
      query.page,
      query.limit,
    );

    const where: Prisma.TransferWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.sourceLocationId) {
      where.sourceLocationId = query.sourceLocationId;
    }

    if (query.destinationLocationId) {
      where.destinationLocationId =
        query.destinationLocationId;
    }

    if (query.search) {
      where.referenceNo = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from
          ? {
              gte: new Date(query.from),
            }
          : {}),
        ...(query.to
          ? {
              lte: new Date(query.to),
            }
          : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        where,
        include: {
          lines: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.transfer.count({
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
    const transfer =
      await this.prisma.transfer.findUnique({
        where: {
          id,
        },
        include: {
          lines: true,
        },
      });

    if (!transfer) {
      throw new NotFoundException(
        'Transfer not found',
      );
    }

    return serializeDecimals(transfer);
  }

  async create(
    dto: CreateTransferDto,
    user: AuthUser,
  ) {
    this.assertUniqueProducts(
      dto.lines.map(
        (line) => line.productId,
      ),
    );

    if (
      dto.sourceLocationId ===
      dto.destinationLocationId
    ) {
      throw new ConflictException(
        'Source and destination locations must be different',
      );
    }

    const referenceNo =
      await this.references.next('INT');

    const transfer =
      await this.prisma.transfer.create({
        data: {
          referenceNo,
          sourceLocationId:
            dto.sourceLocationId,
          destinationLocationId:
            dto.destinationLocationId,
          notes: dto.notes,
          status: OperationStatus.DRAFT,
          createdBy: user.sub,

          lines: {
            create: dto.lines.map(
              (line) => ({
                productId:
                  line.productId,
                quantity:
                  line.quantity,
              }),
            ),
          },
        },

        include: {
          lines: true,
        },
      });

    return serializeDecimals(transfer);
  }

  async validate(
    id: string,
    user: AuthUser,
  ) {
    const transfer =
      await this.prisma.transfer.findUnique({
        where: {
          id,
        },

        include: {
          lines: true,
        },
      });

    if (!transfer) {
      throw new NotFoundException(
        'Transfer not found',
      );
    }

    if (
      transfer.status !==
        OperationStatus.DRAFT &&
      transfer.status !==
        OperationStatus.READY
    ) {
      throw new ConflictException(
        `Transfer cannot be validated from ${transfer.status} status`,
      );
    }

    if (transfer.lines.length === 0) {
      throw new ConflictException(
        'Transfer must contain at least one line',
      );
    }

    await this.inventory.move(
      transfer.id,
      transfer.sourceLocationId,
      transfer.destinationLocationId,

      transfer.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(
          line.quantity,
        ),
      })),
    );

    const updated =
      await this.prisma.$transaction(
        async (tx) => {
          for (const line of transfer.lines) {
            await tx.moveHistory.create({
              data: {
                operationType:
                  'TRANSFER',
                operationId:
                  transfer.id,
                productId:
                  line.productId,
                quantityDelta:
                  -Number(
                    line.quantity,
                  ),
                fromLocationId:
                  transfer.sourceLocationId,
                toLocationId:
                  transfer.destinationLocationId,
                performedBy:
                  user.sub,
              },
            });
          }

          return tx.transfer.update({
            where: {
              id: transfer.id,
            },

            data: {
              status:
                OperationStatus.DONE,
              validatedAt:
                new Date(),
              validatedBy:
                user.sub,
            },

            include: {
              lines: true,
            },
          });
        },
      );

    return serializeDecimals(updated);
  }

  async cancel(id: string) {
    const transfer =
      await this.prisma.transfer.findUnique({
        where: {
          id,
        },
      });

    if (!transfer) {
      throw new NotFoundException(
        'Transfer not found',
      );
    }

    if (
      transfer.status !==
        OperationStatus.DRAFT &&
      transfer.status !==
        OperationStatus.WAITING &&
      transfer.status !==
        OperationStatus.READY
    ) {
      throw new ConflictException(
        `Transfer cannot be canceled from ${transfer.status} status`,
      );
    }

    const updated =
      await this.prisma.transfer.update({
        where: {
          id,
        },

        data: {
          status:
            OperationStatus.CANCELED,
        },

        include: {
          lines: true,
        },
      });

    return serializeDecimals(updated);
  }

  private assertUniqueProducts(
    productIds: string[],
  ): void {
    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      throw new ConflictException(
        'Each transfer line must reference a unique product',
      );
    }
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