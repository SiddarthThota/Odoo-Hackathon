import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    stock: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product with valid data', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue({
        id: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        category: 'Test',
        unit: 'PCS',
        price: 100,
        cost: 50,
        isActive: true,
      });

      const result = await service.create({
        sku: 'test-001',
        name: 'Test Product',
        category: 'Test',
        unit: 'pcs',
        price: 100,
        cost: 50,
      });

      expect(result.sku).toBe('TEST-001');
      expect(prisma.product.create).toHaveBeenCalled();
    });

    it('should reject duplicate SKU', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: '1', sku: 'TEST-001' });

      await expect(
        service.create({
          sku: 'TEST-001',
          name: 'Duplicate',
          category: 'Test',
          unit: 'PCS',
          price: 100,
          cost: 50,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ]);
      prisma.product.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(2);
    });

    it('should cap limit at 100', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 500 });

      expect(result.meta.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return product with stock summary', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: '1',
        sku: 'TEST-001',
        name: 'Test',
      });
      prisma.stock.aggregate.mockResolvedValue({
        _sum: { quantity: 100, reservedQuantity: 10, availableQuantity: 90 },
      });

      const result = await service.findOne('1');

      expect(result.stock.onHand).toBe(100);
      expect(result.stock.reserved).toBe(10);
      expect(result.stock.available).toBe(90);
    });
  });

  describe('remove', () => {
    it('should soft-delete product with stock', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: '1', sku: 'TEST-001' });
      prisma.stock.count.mockResolvedValue(5);
      prisma.product.update.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.remove('1');

      expect(result.message).toContain('deactivated');
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });
  });
});
