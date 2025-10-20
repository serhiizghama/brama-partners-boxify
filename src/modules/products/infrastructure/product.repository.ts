import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from '../../../domain/products/entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ListProductsQuery } from '../dto/list-products.query';
import { ProductWhereConditions, SortOptions, SortDirection } from '../../../common/types/where-conditions';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async findAndCount(q: ListProductsQuery): Promise<[ProductEntity[], number]> {
    const where: ProductWhereConditions[] | ProductWhereConditions = q.search
      ? [{ name: ILike(`%${q.search}%`) }, { barcode: ILike(`%${q.search}%`) }]
      : {};

    const order: SortOptions = { [q.sort_by]: q.direction.toUpperCase() as SortDirection };
    
    return await this.repo.findAndCount({
      where,
      order,
      take: q.limit,
      skip: q.offset,
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<boolean> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return false;
    
    await this.repo.remove(entity);
    return true;
  }
}
