import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { AdjustmentQueryDto, CreateAdjustmentDto } from './dto/adjustment.dto';
import { AdjustmentsService } from './adjustments.service';

@ApiTags('Stock Adjustments')
@ApiBearerAuth()
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List stock adjustments' })
  findAll(@Query() query: AdjustmentQueryDto) {
    return this.adjustmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get adjustment detail' })
  findOne(@Param('id') id: string) {
    return this.adjustmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create adjustment and snapshot recorded stock from Inventory Service' })
  create(@Body() dto: CreateAdjustmentDto, @CurrentUser() user: AuthUser) {
    return this.adjustmentsService.create(dto, user);
  }

  @Post(':id/apply')
  @Roles('InventoryManager')
  @ApiOperation({ summary: 'Apply adjustment delta to Inventory Service' })
  apply(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.adjustmentsService.apply(id, user);
  }
}
