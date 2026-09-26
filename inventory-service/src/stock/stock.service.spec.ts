import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('StockService', () => {
  let service: StockService;
  let prisma: any;

  const mockProduct = { id: 'p1', sku: 'TEST-001', reorderLevel: 100 };
  const mockWarehouse = { id: 'w1', code: 'WH-MAIN' };
  const mockLocation = { id: 'l1', code: 'A-01', warehouseId: 'w1' };

  const mockPrismaService = {
    product: { findUnique: jest.fn() },
    warehouse: { findUnique: jest.fn() },
    location: { findUnique: jest.fn() },
    stock: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(mockPrismaService)),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();

    // Default mocks for validation
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
    prisma.location.findUnique.mockResolvedValue(mockLocation);
  });

  describe('increaseStock', () => {
    it('should create new stock record if none exists', async () => {
      prisma.stock.findUnique.mockResolvedValue(null);
      prisma.stock.create.mockResolvedValue({
        id: 's1',
        quantity: 100,
        availableQuantity: 100,
        reservedQuantity: 0,
        product: { sku: 'TEST-001', name: 'Test' },
        warehouse: { code: 'WH-MAIN', name: 'Main' },
        location: { code: 'A-01' },
      });

      const result = await service.increaseStock({
        productId: 'p1',
        warehouseId: 'w1',
        locationId: 'l1',
        quantity: 100,
      });

      expect(result.quantity).toBe(100);
    });

    it('should increment existing stock', async () => {
      prisma.stock.findUnique.mockResolvedValue({
        id: 's1',
        quantity: 50,
        availableQuantity: 50,
      });
      prisma.stock.update.mockResolvedValue({
        id: 's1',
        quantity: 150,
        availableQuantity: 150,
        product: { sku: 'TEST-001', name: 'Test' },
        warehouse: { code: 'WH-MAIN', name: 'Main' },
        location: { code: 'A-01' },
      });

      const result = await service.increaseStock({
        productId: 'p1',
        warehouseId: 'w1',
        locationId: 'l1',
        quantity: 100,
      });

      expect(result.quantity).toBe(150);
    });
  });

  describe('decreaseStock', () => {
    it('should reject if insufficient stock', async () => {
      prisma.stock.findUnique.mockResolvedValue({
        id: 's1',
        quantity: 50,
        availableQuantity: 40,
      });

      await expect(
        service.decreaseStock({
          productId: 'p1',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject if no stock record exists', async () => {
      prisma.stock.findUnique.mockResolvedValue(null);

      await expect(
        service.decreaseStock({
          productId: 'p1',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reserveStock', () => {
    it('should reject if insufficient available', async () => {
      prisma.stock.findUnique.mockResolvedValue({
        id: 's1',
        quantity: 100,
        availableQuantity: 5,
        reservedQuantity: 95,
      });

      await expect(
        service.reserveStock({
          productId: 'p1',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 10,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('releaseStock', () => {
    it('should reject if releasing more than reserved', async () => {
      prisma.stock.findUnique.mockResolvedValue({
        id: 's1',
        reservedQuantity: 5,
      });

      await expect(
        service.releaseStock({
          productId: 'p1',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 10,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validation', () => {
    it('should reject non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.increaseStock({
          productId: 'invalid',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject location-warehouse mismatch', async () => {
      prisma.location.findUnique.mockResolvedValue({
        id: 'l1',
        code: 'A-01',
        warehouseId: 'different-warehouse',
      });

      await expect(
        service.increaseStock({
          productId: 'p1',
          warehouseId: 'w1',
          locationId: 'l1',
          quantity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
