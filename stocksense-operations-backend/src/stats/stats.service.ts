import { Injectable } from '@nestjs/common';
import { OperationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { serializeDecimals } from '../common/prisma-result';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const activeStatuses = [OperationStatus.DRAFT, OperationStatus.WAITING, OperationStatus.READY];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [pendingReceipts, pendingDeliveries, scheduledTransfers, adjustmentsToday] = await this.prisma.$transaction([
      this.prisma.receipt.count({ where: { status: { in: activeStatuses } } }),
      this.prisma.delivery.count({ where: { status: { in: activeStatuses } } }),
      this.prisma.transfer.count({ where: { status: { in: activeStatuses } } }),
      this.prisma.adjustment.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    return {
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      adjustmentsToday,
    };
  }

  async byStatus() {
    const [receipts, deliveries, transfers, adjustments] = await Promise.all([
      this.prisma.receipt.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.delivery.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.transfer.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.adjustment.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return {
      receipts: this.mapStatusCounts(receipts),
      deliveries: this.mapStatusCounts(deliveries),
      transfers: this.mapStatusCounts(transfers),
      adjustments: this.mapStatusCounts(adjustments),
    };
  }

  async recentActivity(limit = 10) {
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const entries = await this.prisma.moveHistory.findMany({
      orderBy: { occurredAt: 'desc' },
      take: safeLimit,
    });
    return serializeDecimals(entries);
  }

  private mapStatusCounts(
    items: Array<{ status: OperationStatus; _count: { _all: number } }>,
  ) {
    return items.map((item) => ({
      status: item.status,
      count: item._count._all,
    }));
  }
}
