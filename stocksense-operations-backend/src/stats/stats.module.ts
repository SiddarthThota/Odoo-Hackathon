import { Module } from '@nestjs/common';
import { MoveHistoryModule } from '../move-history/move-history.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [MoveHistoryModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
