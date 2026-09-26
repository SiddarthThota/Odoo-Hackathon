import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateTransferDto, TransferQueryDto } from './dto/transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('Internal Transfers')
@ApiBearerAuth()
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @ApiOperation({ summary: 'List internal transfers' })
  findAll(@Query() query: TransferQueryDto) {
    return this.transfersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer detail' })
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create internal transfer in DRAFT' })
  create(@Body() dto: CreateTransferDto, @CurrentUser() user: AuthUser) {
    return this.transfersService.create(dto, user);
  }

  @Post(':id/validate')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Validate transfer and atomically move stock' })
  validate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.transfersService.validate(id, user);
  }

  @Post(':id/cancel')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Cancel internal transfer' })
  cancel(@Param('id') id: string) {
    return this.transfersService.cancel(id);
  }
}
