import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
} from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ── Security ─────────────────────────────────
  app.use(helmet());

  // ── CORS ─────────────────────────────────────
  const frontendUrl = configService.get<string>('cors.frontendUrl');
  app.enableCors({
    origin: true, // Allow any origin to connect via localtunnel/IP
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global Prefix ────────────────────────────
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/db'],
  });

  // ── Global Pipes ─────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global Filters ───────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global Interceptors ──────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Swagger ──────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StockSense Inventory Service')
    .setDescription(
      'REST API for StockSense Inventory Management Service. ' +
        'Manages products, stock, warehouses, locations, reorder rules, and dashboard analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Users', 'User management (admin only)')
    .addTag('Products', 'Product CRUD and management')
    .addTag('Warehouses', 'Warehouse CRUD and management')
    .addTag('Locations', 'Location CRUD within warehouses')
    .addTag('Stock', 'Stock queries and internal operations')
    .addTag('Reorder Rules', 'Reorder rule management')
    .addTag('Dashboard', 'Dashboard analytics and summaries')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ── Health Check Routes ──────────────────────
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  expressApp.get('/health/db', async (_req: any, res: any) => {
    try {
      const { PrismaService } = await import('./prisma/prisma.service');
      const prisma = app.get(PrismaService);
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ── Start Server ─────────────────────────────
  const port = configService.get<number>('port') || 3001;
  await app.listen(port);

  logger.log(`🚀 StockSense Inventory Service running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
  logger.log(`❤️  Health check at http://localhost:${port}/health`);
  logger.log(`🌐 CORS enabled for: ${frontendUrl}`);
}

bootstrap();
