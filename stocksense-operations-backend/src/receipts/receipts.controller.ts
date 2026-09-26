import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateReceiptDto, UpdateReceiptDto } from './dto/receipt.dto';
import { ReceiptQueryDto } from './dto/receipt-query.dto';
import { ReceiptsService } from './receipts.service';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List receipts' })
  findAll(@Query() query: ReceiptQueryDto) {
    return this.receiptsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt detail' })
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create receipt in DRAFT' })
  create(@Body() dto: CreateReceiptDto, @CurrentUser() user: AuthUser) {
    return this.receiptsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update receipt while DRAFT/WAITING' })
  update(@Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    return this.receiptsService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit receipt for processing' })
  submit(@Param('id') id: string) {
    return this.receiptsService.submit(id);
  }

  @Post(':id/validate')
  @Roles('InventoryManager')
  @ApiOperation({ summary: 'Validate a READY receipt and apply stock increment' })
  validate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.receiptsService.validate(id, user);
  }

  @Post(':id/cancel')
  @Roles('InventoryManager')
  @ApiOperation({ summary: 'Cancel receipt' })
  cancel(@Param('id') id: string) {
    return this.receiptsService.cancel(id);
  }

  @Delete(':id')
  @Roles('InventoryManager')
  @ApiOperation({ summary: 'Delete a DRAFT receipt' })
  remove(@Param('id') id: string) {
    return this.receiptsService.remove(id);
  }
}
