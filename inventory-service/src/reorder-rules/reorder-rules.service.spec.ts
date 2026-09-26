import { Test, TestingModule } from '@nestjs/testing';
import { ReorderRulesService } from './reorder-rules.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('ReorderRulesService', () => {
  let service: ReorderRulesService;
  let prisma: any;

  const mockPrismaService = {
    product: { findUnique: jest.fn() },
    warehouse: { findUnique: jest.fn() },
    reorderRule: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReorderRulesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReorderRulesService>(ReorderRulesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should reject non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          productId: 'invalid',
          warehouseId: 'w1',
          minimumStock: 10,
          maximumStock: 100,
          reorderQuantity: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if min >= max', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.warehouse.findUnique.mockResolvedValue({ id: 'w1' });
      prisma.reorderRule.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          productId: 'p1',
          warehouseId: 'w1',
          minimumStock: 100,
          maximumStock: 50,
          reorderQuantity: 25,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate rule', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.warehouse.findUnique.mockResolvedValue({ id: 'w1' });
      prisma.reorderRule.findUnique.mockResolvedValue({ id: 'r1' });

      await expect(
        service.create({
          productId: 'p1',
          warehouseId: 'w1',
          minimumStock: 10,
          maximumStock: 100,
          reorderQuantity: 50,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
