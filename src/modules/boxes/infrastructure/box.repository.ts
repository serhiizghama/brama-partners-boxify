import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BoxEntity } from '../../../domain/boxes/entities/box.entity';
import { ListBoxesQuery } from '../dto/list-boxes.query';
import { UpdateBoxDto } from '../dto/update-box.dto';
import { BoxWhereConditions, SortOptions, SortDirection } from '../../../common/types/where-conditions';
import { CreateBoxDto } from '../dto/create-box.dto';

@Injectable()
export class BoxRepository {
  constructor(
    @InjectRepository(BoxEntity)
    private readonly repo: Repository<BoxEntity>,
  ) { }

  async create(dto: CreateBoxDto): Promise<BoxEntity> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async findAndCount(q: ListBoxesQuery): Promise<[BoxEntity[], number]> {
    const where: BoxWhereConditions = {};

    if (q.search) {
      where.label = ILike(`%${q.search}%`);
    }

    if (q.status) {
      where.status = q.status;
    }

    const order: SortOptions = { [q.sort_by]: q.direction.toUpperCase() as SortDirection };

    return await this.repo.findAndCount({
      where,
      order,
      take: q.limit,
      skip: q.offset,
    });
  }

  async findById(id: string): Promise<BoxEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async update(id: string, dto: UpdateBoxDto): Promise<BoxEntity> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Box with ID "${id}" not found`);
    }

    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<boolean> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Box with ID "${id}" not found`);
    }

    await this.repo.remove(entity);
    return true;
  }
}
