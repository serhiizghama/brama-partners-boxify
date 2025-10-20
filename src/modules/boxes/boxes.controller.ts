import { Controller, Get, Query } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { ListBoxesQuery } from './dto/list-boxes.query';

@Controller('boxes')
export class BoxesController {
  constructor(private readonly service: BoxesService) { }

  @Get()
  list(@Query() q: ListBoxesQuery) {
    return this.service.list(q);
  }
}
