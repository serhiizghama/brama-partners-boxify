import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BoxEntity } from '../../domain/boxes/box.entity';
import { ListBoxesQuery } from './dto/list-boxes.query';

@Injectable()
export class BoxesService {
  constructor(
    @InjectRepository(BoxEntity)
    private readonly repo: Repository<BoxEntity>,
  ) { }

  async list(q: ListBoxesQuery) {
    const where: any = {};

    if (q.search) {
      where.label = ILike(`%${q.search}%`);
    }

    if (q.status) {
      where.status = q.status;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [q.sort_by]: q.direction.toUpperCase() as 'ASC' | 'DESC' },
      take: q.limit,
      skip: q.offset,
    });

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
