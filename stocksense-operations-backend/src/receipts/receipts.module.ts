import { Module } from '@nestjs/common';
import { InventoryClientModule } from '../inventory-client/inventory-client.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

@Module({
  imports: [InventoryClientModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
