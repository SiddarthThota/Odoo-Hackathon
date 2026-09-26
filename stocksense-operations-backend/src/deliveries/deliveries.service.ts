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

import {
  INVENTORY_CLIENT,
} from '../inventory-client/inventory-client.token';

import { InventoryClient } from '../inventory-client/inventory.types';
import { AuthUser } from '../common/types/auth-user';

import {
  CreateDeliveryDto,
  UpdateDeliveryDto,
} from './dto/delivery.dto';

import { DeliveryQueryDto } from './dto/delivery-query.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly references: ReferenceGeneratorService,
    @Inject(INVENTORY_CLIENT)
    private readonly inventory: InventoryClient,
  ) {}

  async findAll(query: DeliveryQueryDto) {
    const { page, limit, skip } = this.normalizeQuery(
      query.page,
      query.limit,
    );

    const where: Prisma.DeliveryWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query.search) {
      where.OR = [
        {
          referenceNo: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerRef: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.from || query.to) {
      where.scheduledDate = {
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

    const allowedSortFields = [
      'createdAt',
      'scheduledDate',
      'referenceNo',
      'status',
    ] as const;

    const sortBy = allowedSortFields.includes(
      query.sortBy as (typeof allowedSortFields)[number],
    )
      ? (query.sortBy as (typeof allowedSortFields)[number])
      : 'createdAt';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.delivery.findMany({
        where,
        include: {
          lines: true,
        },
        orderBy: {
          [sortBy]: query.order,
        } as Prisma.DeliveryOrderByWithRelationInput,
        skip,
        take: limit,
      }),

      this.prisma.delivery.count({
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
    const delivery = await this.prisma.delivery.findUnique({
      where: {
        id,
      },
      include: {
        lines: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    return serializeDecimals(delivery);
  }

  async create(
    dto: CreateDeliveryDto,
    user: AuthUser,
  ) {
    this.assertUniqueProducts(
      dto.lines.map((line) => line.productId),
    );

    const referenceNo =
      await this.references.next('DEL');

    const delivery =
      await this.prisma.delivery.create({
        data: {
          referenceNo,
          customerRef: dto.customerRef,
          warehouseId: dto.warehouseId,
          scheduledDate: new Date(
            dto.scheduledDate,
          ),
          notes: dto.notes,
          createdBy: user.sub,
          status: OperationStatus.DRAFT,

          lines: {
            create: dto.lines.map((line) => ({
              productId: line.productId,
              expectedQty: line.expectedQty,
              deliveredQty:
                line.deliveredQty ?? null,
              unitOfMeasure:
                line.unitOfMeasure,
            })),
          },
        },

        include: {
          lines: true,
        },
      });

    return serializeDecimals(delivery);
  }

  async update(
    id: string,
    dto: UpdateDeliveryDto,
  ) {
    const existing =
      await this.prisma.delivery.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    if (
      existing.status !== OperationStatus.DRAFT &&
      existing.status !== OperationStatus.WAITING
    ) {
      throw new ConflictException(
        'Only DRAFT or WAITING deliveries can be updated',
      );
    }

    if (dto.lines) {
      this.assertUniqueProducts(
        dto.lines.map((line) => line.productId),
      );
    }

    const delivery =
      await this.prisma.$transaction(
        async (tx) => {
          if (dto.lines) {
            await tx.deliveryLine.deleteMany({
              where: {
                deliveryId: id,
              },
            });
          }

          return tx.delivery.update({
            where: {
              id,
            },

            data: {
              ...(dto.customerRef !== undefined
                ? {
                    customerRef:
                      dto.customerRef,
                  }
                : {}),

              ...(dto.warehouseId !== undefined
                ? {
                    warehouseId:
                      dto.warehouseId,
                  }
                : {}),

              ...(dto.scheduledDate !==
              undefined
                ? {
                    scheduledDate: new Date(
                      dto.scheduledDate,
                    ),
                  }
                : {}),

              ...(dto.notes !== undefined
                ? {
                    notes: dto.notes,
                  }
                : {}),

              ...(dto.lines
                ? {
                    lines: {
                      create: dto.lines.map(
                        (line) => ({
                          productId:
                            line.productId,
                          expectedQty:
                            line.expectedQty,
                          deliveredQty:
                            line.deliveredQty ??
                            null,
                          unitOfMeasure:
                            line.unitOfMeasure,
                        }),
                      ),
                    },
                  }
                : {}),
            },

            include: {
              lines: true,
            },
          });
        },
      );

    return serializeDecimals(delivery);
  }

  async pick(id: string) {
    const delivery =
      await this.prisma.delivery.findUnique({
        where: {
          id,
        },

        include: {
          lines: true,
        },
      });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    if (delivery.status !== OperationStatus.DRAFT) {
      throw new ConflictException(
        `Delivery cannot be picked from ${delivery.status} status`,
      );
    }

    if (delivery.lines.length === 0) {
      throw new ConflictException(
        'Delivery must contain at least one line',
      );
    }

    const now = new Date();

    const updated =
      await this.prisma.$transaction(
        async (tx) => {
          await tx.deliveryLine.updateMany({
            where: {
              deliveryId: id,
            },

            data: {
              pickedAt: now,
            },
          });

          return tx.delivery.update({
            where: {
              id,
            },

            data: {
              status:
                OperationStatus.WAITING,
              pickedAt: now,
            },

            include: {
              lines: true,
            },
          });
        },
      );

    return serializeDecimals(updated);
  }

  async pack(id: string) {
    const delivery =
      await this.prisma.delivery.findUnique({
        where: {
          id,
        },

        include: {
          lines: true,
        },
      });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    if (
      delivery.status !==
      OperationStatus.WAITING
    ) {
      throw new ConflictException(
        `Delivery cannot be packed from ${delivery.status} status`,
      );
    }

    if (
      delivery.lines.some(
        (line) => !line.pickedAt,
      )
    ) {
      throw new ConflictException(
        'All delivery lines must be picked before packing',
      );
    }

    const now = new Date();

    const updated =
      await this.prisma.$transaction(
        async (tx) => {
          await tx.deliveryLine.updateMany({
            where: {
              deliveryId: id,
            },

            data: {
              packedAt: now,
            },
          });

          return tx.delivery.update({
            where: {
              id,
            },

            data: {
              status:
                OperationStatus.READY,
              packedAt: now,
            },

            include: {
              lines: true,
            },
          });
        },
      );

    return serializeDecimals(updated);
  }

  async validate(
    id: string,
    user: AuthUser,
  ) {
    const delivery =
      await this.prisma.delivery.findUnique({
        where: {
          id,
        },

        include: {
          lines: true,
        },
      });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    if (
      delivery.status !==
      OperationStatus.READY
    ) {
      throw new ConflictException(
        'Delivery must be READY before validation',
      );
    }

    if (
      delivery.lines.some(
        (line) =>
          line.deliveredQty === null ||
          Number(line.deliveredQty) < 0,
      )
    ) {
      throw new ConflictException(
        'Every delivery line must have a non-negative delivered quantity before validation',
      );
    }

    if (
      delivery.lines.every(
        (line) =>
          Number(line.deliveredQty ?? 0) === 0,
      )
    ) {
      throw new ConflictException(
        'Delivery must have at least one delivered quantity greater than zero',
      );
    }

    if (
      delivery.lines.some(
        (line) =>
          !line.pickedAt ||
          !line.packedAt,
      )
    ) {
      throw new ConflictException(
        'All delivery lines must be picked and packed before validation',
      );
    }

    await this.inventory.decrement(
      delivery.id,
      delivery.warehouseId,

      delivery.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(
          line.deliveredQty,
        ),
      })),
    );

    const updated =
      await this.prisma.$transaction(
        async (tx) => {
          for (const line of delivery.lines) {
            const quantity = Number(
              line.deliveredQty ?? 0,
            );

            if (quantity <= 0) {
              continue;
            }

            await tx.moveHistory.create({
              data: {
                operationType:
                  'DELIVERY',
                operationId:
                  delivery.id,
                productId:
                  line.productId,
                quantityDelta:
                  -quantity,
                fromLocationId: null,
                toLocationId: null,
                performedBy:
                  user.sub,
              },
            });
          }

          return tx.delivery.update({
            where: {
              id: delivery.id,
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
    const delivery =
      await this.prisma.delivery.findUnique({
        where: {
          id,
        },
      });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery order not found',
      );
    }

    if (
      delivery.status !==
        OperationStatus.DRAFT &&
      delivery.status !==
        OperationStatus.WAITING &&
      delivery.status !==
        OperationStatus.READY
    ) {
      throw new ConflictException(
        `Delivery cannot be canceled from ${delivery.status} status`,
      );
    }

    const updated =
      await this.prisma.delivery.update({
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
        'Each delivery line must reference a unique product',
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