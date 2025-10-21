import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQuery } from './dto/list-products.query';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductEntity } from '../../domain/products/entities/product.entity';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['name', 'barcode', 'created_at', 'updated_at'] })
  @ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'A list of products.', type: [ProductEntity] })
  list(@Query() q: ListProductsQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'The product.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The updated product.', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
