import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: any;

  const mockPrismaService = {
    warehouse: { findUnique: jest.fn() },
    location: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    stock: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should reject if warehouse not found', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ warehouseId: 'invalid', code: 'A-01', capacity: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate code in same warehouse', async () => {
      prisma.warehouse.findUnique.mockResolvedValue({ id: 'w1' });
      prisma.location.findUnique.mockResolvedValue({ id: 'l1', code: 'A-01' });

      await expect(
        service.create({ warehouseId: 'w1', code: 'A-01', capacity: 1000 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow same code in different warehouse', async () => {
      prisma.warehouse.findUnique.mockResolvedValue({ id: 'w2' });
      prisma.location.findUnique.mockResolvedValue(null);
      prisma.location.create.mockResolvedValue({
        id: 'l2',
        code: 'A-01',
        warehouseId: 'w2',
        warehouse: { id: 'w2', code: 'WH-PROD', name: 'Production' },
      });

      const result = await service.create({ warehouseId: 'w2', code: 'A-01', capacity: 1000 });
      expect(result.code).toBe('A-01');
    });
  });
});
