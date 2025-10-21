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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiProductResponses,
  ApiProductListResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiStandardListQuery,
} from '../../common/decorators';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiProductResponses()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiStandardListQuery(['name', 'barcode', 'created_at', 'updated_at'])
  @ApiProductListResponse()
  list(@Query() q: ListProductsQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiProductResponses()
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiProductResponses()
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiNoContentResponse('The product has been successfully deleted.')
  @ApiNotFoundResponse()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
