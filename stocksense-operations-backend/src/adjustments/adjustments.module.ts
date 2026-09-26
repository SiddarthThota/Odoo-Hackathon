import { Module } from '@nestjs/common';
import { InventoryClientModule } from '../inventory-client/inventory-client.module';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentsService } from './adjustments.service';

@Module({
  imports: [InventoryClientModule],
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService],
})
export class AdjustmentsModule {}
