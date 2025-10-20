import { Injectable } from '@nestjs/common';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { BoxRepository } from './infrastructure/box.repository';

@Injectable()
export class BoxesService {
  constructor(private readonly boxRepository: BoxRepository) { }

  async list(q: ListBoxesQuery) {
    const [data, total] = await this.boxRepository.findAndCount(q);

    return {
      data,
      pagination: {
        limit: q.limit,
        offset: q.offset,
        total,
      },
    };
  }
}
