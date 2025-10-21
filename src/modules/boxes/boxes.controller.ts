import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';

@Controller('boxes')
export class BoxesController {
  constructor(private readonly service: BoxesService) { }

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
