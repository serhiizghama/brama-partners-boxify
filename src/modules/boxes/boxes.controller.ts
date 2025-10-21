import { Controller, Get, Patch, Delete, Param, Body, Query, Post, HttpCode } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';
import { CreateBoxDto } from './dto/create-box.dto';
import { AddProductsDto } from './dto/add-products.dto';
import { RemoveProductsDto } from './dto/remove-products.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBoxResponses,
  ApiBoxListResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBoxProductOperationsResponse,
  ApiBoxListQuery,
} from '../../common/decorators';

@ApiTags('boxes')
@Controller('boxes')
export class BoxesController {
  constructor(private readonly service: BoxesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new box' })
  @ApiBoxResponses()
  create(@Body() dto: CreateBoxDto) {
    return this.service.create(dto);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Add products to a box' })
  @ApiBoxProductOperationsResponse()
  addProducts(@Param('id') id: string, @Body() dto: AddProductsDto) {
    return this.service.addProducts(id, dto);
  }

  @Delete(':id/products')
  @ApiOperation({ summary: 'Remove products from a box' })
  @ApiBoxProductOperationsResponse()
  removeProducts(@Param('id') id: string, @Body() dto: RemoveProductsDto) {
    return this.service.removeProducts(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all boxes' })
  @ApiBoxListQuery()
  @ApiBoxListResponse()
  list(@Query() q: ListBoxesQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a box by id' })
  @ApiBoxResponses()
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a box' })
  @ApiBoxResponses()
  update(@Param('id') id: string, @Body() dto: UpdateBoxDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a box' })
  @ApiNoContentResponse('The box has been successfully deleted.')
  @ApiNotFoundResponse()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
