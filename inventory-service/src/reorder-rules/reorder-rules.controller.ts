import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReorderRulesService } from './reorder-rules.service';
import { CreateReorderRuleDto, UpdateReorderRuleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Reorder Rules')
@Controller('reorder-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReorderRulesController {
  constructor(private readonly reorderRulesService: ReorderRulesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a reorder rule' })
  @ApiResponse({ status: 201, description: 'Reorder rule created' })
  @ApiResponse({ status: 409, description: 'Duplicate rule' })
  async create(@Body() dto: CreateReorderRuleDto) {
    return this.reorderRulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List reorder rules with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return this.reorderRulesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      productId,
      warehouseId,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reorder rule by ID' })
  @ApiResponse({ status: 200, description: 'Reorder rule found' })
  @ApiResponse({ status: 404, description: 'Reorder rule not found' })
  async findOne(@Param('id') id: string) {
    return this.reorderRulesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update a reorder rule' })
  @ApiResponse({ status: 200, description: 'Reorder rule updated' })
  @ApiResponse({ status: 404, description: 'Reorder rule not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateReorderRuleDto) {
    return this.reorderRulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Deactivate a reorder rule' })
  @ApiResponse({ status: 200, description: 'Reorder rule deactivated' })
  @ApiResponse({ status: 404, description: 'Reorder rule not found' })
  async remove(@Param('id') id: string) {
    return this.reorderRulesService.remove(id);
  }
}
