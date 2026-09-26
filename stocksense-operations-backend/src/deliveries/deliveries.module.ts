import { Module } from '@nestjs/common';
import { InventoryClientModule } from '../inventory-client/inventory-client.module';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';

@Module({
  imports: [InventoryClientModule],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
})
export class DeliveriesModule {}
