import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MoveHistoryQueryDto } from './move-history.dto';
import { MoveHistoryService } from './move-history.service';

@ApiTags('Move History')
@ApiBearerAuth()
@Controller('move-history')
export class MoveHistoryController {
  constructor(private readonly moveHistoryService: MoveHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'List immutable move-history entries' })
  findAll(@Query() query: MoveHistoryQueryDto) {
    return this.moveHistoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a move-history entry' })
  findOne(@Param('id') id: string) {
    return this.moveHistoryService.findOne(id);
  }
}
