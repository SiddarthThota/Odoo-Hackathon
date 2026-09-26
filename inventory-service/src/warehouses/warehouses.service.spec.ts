import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesService } from './warehouses.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('WarehousesService', () => {
  let service: WarehousesService;
  let prisma: any;

  const mockPrismaService = {
    warehouse: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        WarehousesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WarehousesService>(WarehousesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a warehouse', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);
      prisma.warehouse.create.mockResolvedValue({
        id: '1',
        code: 'WH-TEST',
        name: 'Test Warehouse',
        capacity: 5000,
      });

      const result = await service.create({
        code: 'wh-test',
        name: 'Test Warehouse',
        capacity: 5000,
      });

      expect(result.code).toBe('WH-TEST');
    });

    it('should reject duplicate code', async () => {
      prisma.warehouse.findUnique.mockResolvedValue({ id: '1', code: 'WH-TEST' });

      await expect(
        service.create({ code: 'WH-TEST', name: 'Test', capacity: 5000 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should reject capacity below occupancy', async () => {
      prisma.warehouse.findUnique.mockResolvedValue({
        id: '1',
        code: 'WH-MAIN',
        capacity: 20000,
      });
      prisma.stock.aggregate.mockResolvedValue({
        _sum: { quantity: 15000 },
      });

      await expect(
        service.update('1', { capacity: 10000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return warehouse with utilization', async () => {
      prisma.warehouse.findUnique.mockResolvedValue({
        id: '1',
        code: 'WH-MAIN',
        name: 'Main',
        capacity: 20000,
        _count: { locations: 6 },
      });
      prisma.stock.aggregate.mockResolvedValue({
        _sum: { quantity: 14000 },
      });

      const result = await service.findOne('1');

      expect(result.utilization).toBe(70);
      expect(result.occupied).toBe(14000);
      expect(result.available).toBe(6000);
    });

    it('should throw NotFoundException', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
