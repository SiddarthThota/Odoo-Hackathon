import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Operation dashboard summary statistics' })
  summary() {
    return this.statsService.summary();
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Operation counts grouped by status and document type' })
  byStatus() {
    return this.statsService.byStatus();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Recent move-history activity' })
  recentActivity(@Query('limit') limit?: string) {
    return this.statsService.recentActivity(Number(limit ?? 10));
  }
}
