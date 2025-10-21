import { Controller, Get, Patch, Delete, Param, Body, Query, Post } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';
import { CreateBoxDto } from './dto/create-box.dto';
import { AddProductsDto } from './dto/add-products.dto';
import { RemoveProductsDto } from './dto/remove-products.dto';

@Controller('boxes')
export class BoxesController {
  constructor(private readonly service: BoxesService) {}

  @Post()
  create(@Body() dto: CreateBoxDto) {
    return this.service.create(dto);
  }

  @Post(':id/products')
  addProducts(@Param('id') id: string, @Body() dto: AddProductsDto) {
    return this.service.addProducts(id, dto);
  }

  @Delete(':id/products')
  removeProducts(@Param('id') id: string, @Body() dto: RemoveProductsDto) {
    return this.service.removeProducts(id, dto);
  }

  @Get()
  list(@Query() q: ListBoxesQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBoxDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
