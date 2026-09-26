import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.accessSecret': 'test-access-secret',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'STAFF',
        isActive: true,
        createdAt: new Date(),
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password@123',
      });

      expect(result.user.email).toBe('john@test.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ConflictException for existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'existing@test.com' });

      await expect(
        service.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@test.com',
          password: 'Password@123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should reject invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'Password@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'inactive@test.com',
        isActive: false,
        passwordHash: await bcrypt.hash('Password@123', 12),
      });

      await expect(
        service.login({ email: 'inactive@test.com', password: 'Password@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        isActive: true,
        passwordHash: await bcrypt.hash('CorrectPassword', 12),
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
