import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateDeliveryDto, UpdateDeliveryDto } from './dto/delivery.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { DeliveriesService } from './deliveries.service';

@ApiTags('Delivery Orders')
@ApiBearerAuth()
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @ApiOperation({ summary: 'List delivery orders' })
  findAll(@Query() query: DeliveryQueryDto) {
    return this.deliveriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery order detail' })
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create delivery order in DRAFT' })
  create(@Body() dto: CreateDeliveryDto, @CurrentUser() user: AuthUser) {
    return this.deliveriesService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery order while DRAFT/WAITING' })
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryDto) {
    return this.deliveriesService.update(id, dto);
  }

  @Post(':id/pick')
  @Roles('STAFF', 'MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Pick delivery lines' })
  pick(@Param('id') id: string) {
    return this.deliveriesService.pick(id);
  }

  @Post(':id/pack')
  @Roles('STAFF', 'MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Pack picked delivery lines' })
  pack(@Param('id') id: string) {
    return this.deliveriesService.pack(id);
  }

  @Post(':id/validate')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Validate delivery and apply stock decrement' })
  validate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.deliveriesService.validate(id, user);
  }

  @Post(':id/cancel')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Cancel delivery order' })
  cancel(@Param('id') id: string) {
    return this.deliveriesService.cancel(id);
  }
}
