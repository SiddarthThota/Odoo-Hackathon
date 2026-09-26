import { ConflictException } from '@nestjs/common';
import { OperationStatus } from '@prisma/client';
import { ReceiptsService } from '../src/receipts/receipts.service';
import { DeliveriesService } from '../src/deliveries/deliveries.service';
import { TransfersService } from '../src/transfers/transfers.service';
import { AdjustmentsService } from '../src/adjustments/adjustments.service';

const user = { sub: 'test-user', role: 'InventoryManager' as const };

function transaction(callbackResult: unknown) {
  return async (arg: unknown) => {
    if (Array.isArray(arg)) return Promise.all(arg);
    return (arg as (tx: unknown) => Promise<unknown>)(callbackResult);
  };
}

describe('ReceiptsService', () => {
  it('creates a draft receipt with lines', async () => {
    const created = {
      id: 'receipt-1',
      referenceNo: 'REC-2026-0001',
      status: OperationStatus.DRAFT,
      lines: [{ productId: 'P1', expectedQty: 10, receivedQty: 10, unitOfMeasure: 'PCS' }],
    };
    const prisma: any = {
      receipt: {
        create: jest.fn().mockResolvedValue(created),
      },
    };
    const refs = { next: jest.fn().mockResolvedValue('REC-2026-0001') };
    const inventory = {} as any;
    const service = new ReceiptsService(prisma, refs as any, inventory);

    const result = await service.create({
      supplierRef: 'SUP-1',
      warehouseId: 'WH-1',
      scheduledDate: '2026-09-26T00:00:00Z',
      lines: [{ productId: 'P1', expectedQty: 10, receivedQty: 10, unitOfMeasure: 'PCS' }],
    }, user);

    expect(result.status).toBe('DRAFT');
    expect(prisma.receipt.create).toHaveBeenCalledTimes(1);
  });

  it('submits a complete receipt directly to READY after the readiness check', async () => {
    const waiting = {
      id: 'receipt-1',
      status: OperationStatus.DRAFT,
      lines: [{ receivedQty: 10 }],
    };
    const tx = {
      receipt: {
        update: jest.fn()
          .mockResolvedValueOnce({ ...waiting, status: OperationStatus.WAITING })
          .mockResolvedValueOnce({ ...waiting, status: OperationStatus.READY }),
      },
    };
    const prisma: any = {
      receipt: {
        findUnique: jest.fn().mockResolvedValue(waiting),
      },
      $transaction: transaction(tx),
    };
    const service = new ReceiptsService(prisma, {} as any, {} as any);

    const result = await service.submit('receipt-1');

    expect(result.status).toBe('READY');
    expect(tx.receipt.update).toHaveBeenCalledTimes(2);
  });

  it('does not mark a receipt DONE until Inventory Service succeeds', async () => {
    const receipt = {
      id: 'receipt-1',
      status: OperationStatus.READY,
      lines: [{ productId: 'P1', receivedQty: 10 }],
      warehouseId: 'WH-1',
    };
    const tx = {
      moveHistory: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      receipt: { update: jest.fn().mockResolvedValue({ ...receipt, status: OperationStatus.DONE }) },
    };
    const prisma: any = {
      receipt: { findUnique: jest.fn().mockResolvedValue(receipt) },
      $transaction: transaction(tx),
    };
    const inventory = { increment: jest.fn().mockResolvedValue(undefined) };
    const service = new ReceiptsService(prisma, {} as any, inventory as any);

    const result = await service.validate('receipt-1', user);

    expect(inventory.increment).toHaveBeenCalledWith('receipt-1', 'WH-1', [{ productId: 'P1', quantity: 10 }]);
    expect(result.status).toBe('DONE');
    expect(tx.moveHistory.createMany).toHaveBeenCalledTimes(1);
  });
});

describe('DeliveriesService', () => {
  it('enforces pick -> pack -> validate', async () => {
    const delivery = {
      id: 'delivery-1',
      status: OperationStatus.DRAFT,
      lines: [{ productId: 'P1', deliveredQty: 3, pickedAt: null, packedAt: null }],
      warehouseId: 'WH-1',
    };
    const tx = {
      deliveryLine: { updateMany: jest.fn().mockResolvedValue({}) },
      delivery: {
        update: jest.fn()
          .mockResolvedValueOnce({ ...delivery, status: OperationStatus.WAITING })
          .mockResolvedValueOnce({ ...delivery, status: OperationStatus.READY }),
      },
    };
    const prisma: any = {
      delivery: { findUnique: jest.fn().mockResolvedValue(delivery) },
      $transaction: transaction(tx),
    };
    const inventory = { decrement: jest.fn().mockResolvedValue(undefined) };
    const service = new DeliveriesService(prisma, {} as any, inventory as any);

    const picked = await service.pick('delivery-1');
    expect(picked.status).toBe('WAITING');

    prisma.delivery.findUnique.mockResolvedValue({
      ...delivery,
      status: OperationStatus.WAITING,
      lines: [{ productId: 'P1', deliveredQty: 3, pickedAt: new Date(), packedAt: null }],
    });
    const packed = await service.pack('delivery-1');
    expect(packed.status).toBe('READY');
  });
});

describe('TransfersService', () => {
  it('rejects a transfer whose source and destination are identical', async () => {
    const prisma: any = { transfer: { create: jest.fn() } };
    const refs = { next: jest.fn() };
    const service = new TransfersService(prisma, refs as any, {} as any);

    await expect(service.create({
      sourceLocationId: 'LOC-A',
      destinationLocationId: 'LOC-A',
      lines: [{ productId: 'P1', quantity: 5 }],
    }, user)).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.transfer.create).not.toHaveBeenCalled();
  });

  it('uses one atomic Inventory move call', async () => {
    const transfer = {
      id: 'transfer-1',
      status: OperationStatus.DRAFT,
      sourceLocationId: 'LOC-A',
      destinationLocationId: 'LOC-B',
      lines: [{ productId: 'P1', quantity: 5 }],
    };
    const tx = {
      moveHistory: { create: jest.fn().mockResolvedValue({}) },
      transfer: { update: jest.fn().mockResolvedValue({ ...transfer, status: OperationStatus.DONE }) },
    };
    const prisma: any = {
      transfer: { findUnique: jest.fn().mockResolvedValue(transfer) },
      $transaction: transaction(tx),
    };
    const inventory = { move: jest.fn().mockResolvedValue(undefined) };
    const service = new TransfersService(prisma, {} as any, inventory as any);

    const result = await service.validate('transfer-1', user);

    expect(result.status).toBe('DONE');
    expect(inventory.move).toHaveBeenCalledTimes(1);
    expect(inventory.move).toHaveBeenCalledWith(
      'transfer-1',
      'LOC-A',
      'LOC-B',
      [{ productId: 'P1', quantity: 5 }],
    );
  });
});

describe('AdjustmentsService', () => {
  it('snapshots live quantity and computes counted minus recorded', async () => {
    const prisma: any = {
      adjustment: { create: jest.fn().mockResolvedValue({ id: 'adjustment-1', recordedQty: 100, countedQty: 97, delta: -3 }) },
    };
    const inventory = { getQuantity: jest.fn().mockResolvedValue(100) };
    const service = new AdjustmentsService(prisma, inventory as any);

    const result = await service.create({ productId: 'P1', locationId: 'LOC-A', countedQty: 97 }, user);

    expect(inventory.getQuantity).toHaveBeenCalledWith('P1', 'LOC-A');
    expect(Number(result.delta)).toBe(-3);
  });
});
