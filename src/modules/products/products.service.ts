import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from '../../domain/products/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQuery } from './dto/list-products.query';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) { }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async list(q: ListProductsQuery) {
    const where = q.search
      ? [{ name: ILike(`%${q.search}%`) }, { barcode: ILike(`%${q.search}%`) }]
      : {};

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

  async getById(id: string): Promise<ProductEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Product not found');
    return entity;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Product not found');

    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Product not found');
    await this.repo.remove(entity);
  }
}
