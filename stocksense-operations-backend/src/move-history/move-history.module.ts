import { Module } from '@nestjs/common';
import { MoveHistoryController } from './move-history.controller';
import { MoveHistoryService } from './move-history.service';

@Module({
  controllers: [MoveHistoryController],
  providers: [MoveHistoryService],
  exports: [MoveHistoryService],
})
export class MoveHistoryModule {}
