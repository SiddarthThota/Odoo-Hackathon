import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpInventoryClient } from './http-inventory.client';
import { MockInventoryClient } from './mock-inventory.client';
import { INVENTORY_CLIENT } from './inventory-client.token';

@Module({
  imports: [HttpModule],
  providers: [
    HttpInventoryClient,
    MockInventoryClient,
    {
      provide: INVENTORY_CLIENT,
      inject: [ConfigService, HttpInventoryClient, MockInventoryClient],
      useFactory: (
        config: ConfigService,
        httpClient: HttpInventoryClient,
        mockClient: MockInventoryClient,
      ) => {
        const mode = config.get<string>('INVENTORY_SERVICE_MODE') ?? 'http';
        return mode === 'mock' ? mockClient : httpClient;
      },
    },
  ],
  exports: [INVENTORY_CLIENT],
})
export class InventoryClientModule {}
