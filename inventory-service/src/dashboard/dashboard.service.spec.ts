import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  const mockPrismaService = {
    stock: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    warehouse: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getInventorySummary', () => {
    it('should return summary with all required fields', async () => {
      prisma.stock.aggregate.mockResolvedValue({ _sum: { quantity: 12000 } });
      prisma.product.count.mockResolvedValue(50);
      prisma.warehouse.aggregate.mockResolvedValue({ _sum: { capacity: 47000 } });
      prisma.$queryRaw.mockResolvedValue([{ total: 18500000 }]);

      const result = await service.getInventorySummary();

      expect(result.totalInventoryValue).toBe(18500000);
      expect(result.inventoryVolume).toBe(12000);
      expect(result.activeSkus).toBe(50);
      expect(result.warehouseCapacity.occupied).toBe(12000);
      expect(result.warehouseCapacity.total).toBe(47000);
      expect(result.warehouseCapacity.percentage).toBeCloseTo(25.53, 1);
    });
  });

  describe('getStockStatus', () => {
    it('should categorize stocks correctly', async () => {
      prisma.stock.findMany.mockResolvedValue([
        { quantity: 500, availableQuantity: 500, product: { reorderLevel: 100 } },
        { quantity: 50, availableQuantity: 50, product: { reorderLevel: 100 } },
        { quantity: 0, availableQuantity: 0, product: { reorderLevel: 100 } },
      ]);

      const result = await service.getStockStatus();

      expect(result.normal).toBe(1);
      expect(result.warning).toBe(1);
      expect(result.critical).toBe(1);
      expect(result.totalSkus).toBe(3);
    });
  });
});
