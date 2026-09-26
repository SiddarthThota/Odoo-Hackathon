import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters';
import { TransformInterceptor } from '../src/common/interceptors';

describe('StockSense Inventory Service (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let adminToken: string;
  let productId: string;
  let warehouseId: string;
  let locationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health', 'health/db'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Health Check ─────────────────────────────
  describe('Health Check', () => {
    it('GET /health should return ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  // ── Auth ─────────────────────────────────────
  describe('Authentication', () => {
    it('POST /api/v1/auth/register should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: `test-${Date.now()}@stocksense.com`,
          password: 'TestPass@123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
          expect(res.body.data.user.email).toBeDefined();
        });
    });

    it('POST /api/v1/auth/login should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@stocksense.com',
          password: 'Admin@123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
          adminToken = res.body.data.accessToken;
          accessToken = adminToken;
        });
    });

    it('POST /api/v1/auth/login should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@stocksense.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('GET /api/v1/auth/me should return current user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.email).toBe('admin@stocksense.com');
          expect(res.body.data.role).toBe('ADMIN');
        });
    });

    it('GET /api/v1/auth/me should reject unauthenticated request', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  // ── Products ─────────────────────────────────
  describe('Products', () => {
    it('POST /api/v1/products should create a product', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sku: `TEST-${Date.now()}`,
          name: 'Test Product',
          category: 'Test',
          unit: 'PCS',
          price: 100,
          cost: 50,
          reorderLevel: 10,
          reorderQuantity: 50,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe('Test Product');
          productId = res.body.data.id;
        });
    });

    it('GET /api/v1/products should list products with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
          expect(res.body.meta.page).toBe(1);
        });
    });

    it('GET /api/v1/products should support search', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?search=wireless')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('GET /api/v1/products/:id should return product with stock', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.stock).toBeDefined();
        });
    });

    it('POST /api/v1/products should reject duplicate SKU', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sku: 'ELEC-WB-001',
          name: 'Duplicate',
          category: 'Test',
          unit: 'PCS',
          price: 100,
          cost: 50,
        })
        .expect(409);
    });

    it('PATCH /api/v1/products/:id should update product', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Test Product' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Updated Test Product');
        });
    });
  });

  // ── Warehouses ───────────────────────────────
  describe('Warehouses', () => {
    it('POST /api/v1/warehouses should create a warehouse', () => {
      return request(app.getHttpServer())
        .post('/api/v1/warehouses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          code: `WH-TEST-${Date.now()}`,
          name: 'Test Warehouse',
          capacity: 5000,
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
        })
        .expect(201)
        .expect((res) => {
          warehouseId = res.body.data.id;
        });
    });

    it('GET /api/v1/warehouses should list warehouses', () => {
      return request(app.getHttpServer())
        .get('/api/v1/warehouses')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });

    it('GET /api/v1/warehouses/:id should return warehouse with capacity info', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.utilization).toBeDefined();
        });
    });
  });

  // ── Locations ────────────────────────────────
  describe('Locations', () => {
    it('POST /api/v1/locations should create a location', () => {
      return request(app.getHttpServer())
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          warehouseId: warehouseId,
          code: 'T-01',
          name: 'Test Location',
          capacity: 1000,
        })
        .expect(201)
        .expect((res) => {
          locationId = res.body.data.id;
        });
    });

    it('GET /api/v1/locations should list locations', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('GET /api/v1/locations should filter by warehouseId', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/locations?warehouseId=${warehouseId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('POST /api/v1/locations should reject invalid warehouseId', () => {
      return request(app.getHttpServer())
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          warehouseId: '00000000-0000-0000-0000-000000000000',
          code: 'X-01',
          capacity: 100,
        })
        .expect(404);
    });
  });

  // ── Stock Operations ─────────────────────────
  describe('Stock', () => {
    it('POST /api/v1/internal/stock/increase should increase stock', () => {
      return request(app.getHttpServer())
        .post('/api/v1/internal/stock/increase')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          warehouseId,
          locationId,
          quantity: 100,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.quantity).toBe(100);
          expect(res.body.data.availableQuantity).toBe(100);
        });
    });

    it('POST /api/v1/internal/stock/decrease should decrease stock', () => {
      return request(app.getHttpServer())
        .post('/api/v1/internal/stock/decrease')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          warehouseId,
          locationId,
          quantity: 30,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.quantity).toBe(70);
        });
    });

    it('POST /api/v1/internal/stock/decrease should reject insufficient stock', () => {
      return request(app.getHttpServer())
        .post('/api/v1/internal/stock/decrease')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          warehouseId,
          locationId,
          quantity: 9999,
        })
        .expect(409);
    });

    it('POST /api/v1/internal/stock/reserve should reserve stock', () => {
      return request(app.getHttpServer())
        .post('/api/v1/internal/stock/reserve')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          warehouseId,
          locationId,
          quantity: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.reservedQuantity).toBe(10);
          expect(res.body.data.availableQuantity).toBe(60);
        });
    });

    it('POST /api/v1/internal/stock/release should release stock', () => {
      return request(app.getHttpServer())
        .post('/api/v1/internal/stock/release')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          warehouseId,
          locationId,
          quantity: 5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.reservedQuantity).toBe(5);
          expect(res.body.data.availableQuantity).toBe(65);
        });
    });

    it('GET /api/v1/stock should list stock records', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stock')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });

    it('GET /api/v1/stock/low should return low stock items', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stock/low')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('GET /api/v1/stock/out-of-stock should return out of stock items', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stock/out-of-stock')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('GET /api/v1/products/:id/stock should return product stock', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/stock`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  // ── Dashboard ────────────────────────────────
  describe('Dashboard', () => {
    it('GET /api/v1/dashboard/inventory-summary should return summary', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/inventory-summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.totalInventoryValue).toBeDefined();
          expect(res.body.data.inventoryVolume).toBeDefined();
          expect(res.body.data.activeSkus).toBeDefined();
          expect(res.body.data.warehouseCapacity).toBeDefined();
        });
    });

    it('GET /api/v1/dashboard/stock-status should return status breakdown', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/stock-status')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.totalSkus).toBeDefined();
          expect(res.body.data.normal).toBeDefined();
          expect(res.body.data.warning).toBeDefined();
          expect(res.body.data.critical).toBeDefined();
        });
    });

    it('GET /api/v1/dashboard/top-inventory-items should return top items', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/top-inventory-items?limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('GET /api/v1/dashboard/warehouse-capacity should return capacity', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard/warehouse-capacity')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.total).toBeDefined();
          expect(res.body.data.warehouses).toBeDefined();
        });
    });
  });

  // ── Authorization ────────────────────────────
  describe('Authorization', () => {
    let staffToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'staff@stocksense.com',
          password: 'Staff@123',
        });
      staffToken = res.body.data.accessToken;
    });

    it('STAFF should NOT be able to create products', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          sku: 'STAFF-TEST',
          name: 'Staff Test',
          category: 'Test',
          unit: 'PCS',
          price: 100,
          cost: 50,
        })
        .expect(403);
    });

    it('STAFF should be able to GET products', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);
    });
  });
});
