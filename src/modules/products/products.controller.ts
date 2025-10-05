import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQuery } from './dto/list-products.query';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListProductsQuery) {
    return this.service.list(q);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }
}
