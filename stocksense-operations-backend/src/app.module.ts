import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { InventoryClientModule } from './inventory-client/inventory-client.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { TransfersModule } from './transfers/transfers.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { MoveHistoryModule } from './move-history/move-history.module';
import { StatsModule } from './stats/stats.module';
import { HealthModule } from './health/health.module';
import { validateEnv } from './common/validators/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    CommonModule,
    InventoryClientModule,
    ReceiptsModule,
    DeliveriesModule,
    TransfersModule,
    AdjustmentsModule,
    MoveHistoryModule,
    StatsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
