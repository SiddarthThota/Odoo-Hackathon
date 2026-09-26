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
import { canTransition } from '../common/domain/operation-state';

import { INVENTORY_CLIENT } from '../inventory-client/inventory-client.token';
import { InventoryClient } from '../inventory-client/inventory.types';

import { AuthUser } from '../common/types/auth-user';

import {
  CreateReceiptDto,
  UpdateReceiptDto,
} from './dto/receipt.dto';

import { ReceiptQueryDto } from './dto/receipt-query.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly references: ReferenceGeneratorService,
    @Inject(INVENTORY_CLIENT)
    private readonly inventory: InventoryClient,
  ) {}

  async findAll(query: ReceiptQueryDto) {
    const { page, limit, skip } = this.normalizeQuery(
      query.page,
      query.limit,
    );

    const where: Prisma.ReceiptWhereInput = {};

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
          supplierRef: {
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
      this.prisma.receipt.findMany({
        where,
        include: {
          lines: true,
        },
        orderBy: {
          [sortBy]: query.order,
        } as Prisma.ReceiptOrderByWithRelationInput,
        skip,
        take: limit,
      }),

      this.prisma.receipt.count({
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
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id,
      },
      include: {
        lines: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return serializeDecimals(receipt);
  }

  async create(dto: CreateReceiptDto, user: AuthUser) {
    this.assertUniqueProducts(
      dto.lines.map((line) => line.productId),
    );

    const referenceNo = await this.references.next('REC');

    const receipt = await this.prisma.receipt.create({
      data: {
        referenceNo,
        supplierRef: dto.supplierRef,
        warehouseId: dto.warehouseId,
        scheduledDate: new Date(dto.scheduledDate),
        notes: dto.notes,
        createdBy: user.sub,
        status: OperationStatus.DRAFT,

        lines: {
          create: dto.lines.map((line) => ({
            productId: line.productId,
            expectedQty: line.expectedQty,
            receivedQty: line.receivedQty ?? null,
            unitOfMeasure: line.unitOfMeasure,
          })),
        },
      },

      include: {
        lines: true,
      },
    });

    return serializeDecimals(receipt);
  }

  async update(id: string, dto: UpdateReceiptDto) {
    const existing = await this.prisma.receipt.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Receipt not found');
    }

    if (
      existing.status !== OperationStatus.DRAFT &&
      existing.status !== OperationStatus.WAITING
    ) {
      throw new ConflictException(
        'Only DRAFT or WAITING receipts can be updated',
      );
    }

    if (dto.lines) {
      this.assertUniqueProducts(
        dto.lines.map((line) => line.productId),
      );
    }

    const receipt = await this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.receiptLine.deleteMany({
          where: {
            receiptId: id,
          },
        });
      }

      const updated = await tx.receipt.update({
        where: {
          id,
        },

        data: {
          ...(dto.supplierRef !== undefined
            ? {
                supplierRef: dto.supplierRef,
              }
            : {}),

          ...(dto.warehouseId !== undefined
            ? {
                warehouseId: dto.warehouseId,
              }
            : {}),

          ...(dto.scheduledDate !== undefined
            ? {
                scheduledDate: new Date(dto.scheduledDate),
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
                  create: dto.lines.map((line) => ({
                    productId: line.productId,
                    expectedQty: line.expectedQty,
                    receivedQty: line.receivedQty ?? null,
                    unitOfMeasure: line.unitOfMeasure,
                  })),
                },
              }
            : {}),
        },

        include: {
          lines: true,
        },
      });

      if (
        existing.status === OperationStatus.WAITING &&
        updated.lines.every(
          (line) => line.receivedQty !== null,
        )
      ) {
        return tx.receipt.update({
          where: {
            id,
          },

          data: {
            status: OperationStatus.READY,
          },

          include: {
            lines: true,
          },
        });
      }

      return updated;
    });

    return serializeDecimals(receipt);
  }

  async submit(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id,
      },

      include: {
        lines: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (
      !canTransition(
        receipt.status,
        OperationStatus.WAITING,
      )
    ) {
      throw new ConflictException(
        `Receipt cannot be submitted from ${receipt.status} status`,
      );
    }

    if (receipt.lines.length === 0) {
      throw new ConflictException(
        'Receipt must contain at least one line',
      );
    }

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const waiting = await tx.receipt.update({
          where: {
            id,
          },

          data: {
            status: OperationStatus.WAITING,
          },

          include: {
            lines: true,
          },
        });

        if (
          !waiting.lines.every(
            (line) => line.receivedQty !== null,
          )
        ) {
          return waiting;
        }

        return tx.receipt.update({
          where: {
            id,
          },

          data: {
            status: OperationStatus.READY,
          },

          include: {
            lines: true,
          },
        });
      },
    );

    return serializeDecimals(updated);
  }

  async validate(id: string, user: AuthUser) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id,
      },

      include: {
        lines: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.status !== OperationStatus.READY) {
      throw new ConflictException(
        'Receipt must be READY before validation',
      );
    }

    if (
      receipt.lines.some(
        (line) =>
          line.receivedQty === null ||
          Number(line.receivedQty) < 0,
      )
    ) {
      throw new ConflictException(
        'All receipt lines must have a received quantity before validation',
      );
    }

    if (
      receipt.lines.every(
        (line) => Number(line.receivedQty) === 0,
      )
    ) {
      throw new ConflictException(
        'Receipt must have at least one received quantity greater than zero',
      );
    }

    await this.inventory.increment(
      receipt.id,
      receipt.warehouseId,

      receipt.lines.map((line) => ({
        productId: line.productId,
        quantity: Number(line.receivedQty),
      })),
    );

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const ledgerRows = receipt.lines
          .filter(
            (line) => Number(line.receivedQty) > 0,
          )
          .map((line) => ({
            operationType: 'RECEIPT' as const,
            operationId: receipt.id,
            productId: line.productId,
            quantityDelta: Number(line.receivedQty),
            fromLocationId: null,
            toLocationId: null,
            performedBy: user.sub,
          }));

        if (ledgerRows.length > 0) {
          await tx.moveHistory.createMany({
            data: ledgerRows,
            skipDuplicates: true,
          });
        }

        return tx.receipt.update({
          where: {
            id: receipt.id,
          },

          data: {
            status: OperationStatus.DONE,
            validatedAt: new Date(),
            validatedBy: user.sub,
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
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (
      receipt.status !== OperationStatus.DRAFT &&
      receipt.status !== OperationStatus.WAITING &&
      receipt.status !== OperationStatus.READY
    ) {
      throw new ConflictException(
        `Receipt cannot be canceled from ${receipt.status} status`,
      );
    }

    const updated = await this.prisma.receipt.update({
      where: {
        id,
      },

      data: {
        status: OperationStatus.CANCELED,
      },

      include: {
        lines: true,
      },
    });

    return serializeDecimals(updated);
  }

  async remove(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.status !== OperationStatus.DRAFT) {
      throw new ConflictException(
        'Only DRAFT receipts can be deleted',
      );
    }

    await this.prisma.receipt.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Receipt deleted successfully',
    };
  }

  private assertUniqueProducts(productIds: string[]): void {
    if (new Set(productIds).size !== productIds.length) {
      throw new ConflictException(
        'Each receipt line must reference a unique product',
      );
    }
  }

  private normalizeQuery(
    page = 1,
    limit = 25,
  ) {
    const safePage = Math.max(
      1,
      Math.floor(Number(page) || 1),
    );

    const safeLimit = Math.min(
      100,
      Math.max(
        1,
        Math.floor(Number(limit) || 25),
      ),
    );

    return {
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    };
  }
}