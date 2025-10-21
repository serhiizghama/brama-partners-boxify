import { Controller, Get, Patch, Delete, Param, Body, Query, Post, HttpCode } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';
import { CreateBoxDto } from './dto/create-box.dto';
import { AddProductsDto } from './dto/add-products.dto';
import { RemoveProductsDto } from './dto/remove-products.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { BoxStatus } from '../../domain/boxes/enums/box-status.enum';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('boxes')
@Controller('boxes')
export class BoxesController {
  constructor(private readonly service: BoxesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new box' })
  @ApiResponse({ status: 201, description: 'The box has been successfully created.', type: BoxEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  create(@Body() dto: CreateBoxDto) {
    return this.service.create(dto);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Add products to a box' })
  @ApiResponse({ status: 200, description: 'The updated box.', type: BoxEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid Status Transition', type: ErrorResponseDto })
  addProducts(@Param('id') id: string, @Body() dto: AddProductsDto) {
    return this.service.addProducts(id, dto);
  }

  @Delete(':id/products')
  @ApiOperation({ summary: 'Remove products from a box' })
  @ApiResponse({ status: 200, description: 'The updated box.', type: BoxEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid Status Transition', type: ErrorResponseDto })
  removeProducts(@Param('id') id: string, @Body() dto: RemoveProductsDto) {
    return this.service.removeProducts(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all boxes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: BoxStatus })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['label', 'status', 'created_at', 'updated_at'] })
  @ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'A list of boxes.', type: [BoxEntity] })
  list(@Query() q: ListBoxesQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a box by id' })
  @ApiResponse({ status: 200, description: 'The box.', type: BoxEntity })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a box' })
  @ApiResponse({ status: 200, description: 'The updated box.', type: BoxEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid Status Transition', type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateBoxDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a box' })
  @ApiResponse({ status: 204, description: 'The box has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
