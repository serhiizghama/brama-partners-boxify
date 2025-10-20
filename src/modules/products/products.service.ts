import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../domain/products/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQuery } from './dto/list-products.query';
import { ProductRepository } from './infrastructure/product.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
  ) { }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    return await this.productRepository.create(dto);
  }

  async list(q: ListProductsQuery) {
    const [data, total] = await this.productRepository.findAndCount(q);

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
    const entity = await this.productRepository.findById(id);
    if (!entity) throw new NotFoundException('Product not found');
    return entity;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const entity = await this.productRepository.update(id, dto);
    if (!entity) throw new NotFoundException('Product not found');
    return entity;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.productRepository.remove(id);
    if (!removed) throw new NotFoundException('Product not found');
  }
}
