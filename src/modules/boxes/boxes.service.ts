import { Injectable, NotFoundException } from '@nestjs/common';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';
import { BoxRepository } from './infrastructure/box.repository';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { BoxStatus } from '../../domain/boxes/enums/box-status.enum';
import {
  BusinessRuleViolationException,
  InvalidStatusTransitionException,
} from '../../common/exceptions';
import { CreateBoxDto } from './dto/create-box.dto';
import { ProductRepository } from '../products/infrastructure/product.repository';
import { DataSource, EntityManager } from 'typeorm';
import { AddProductsDto } from './dto/add-products.dto';
import { RemoveProductsDto } from './dto/remove-products.dto';
import { TransactionRepository } from './infrastructure/transaction.repository';

@Injectable()
export class BoxesService {
  constructor(
    private readonly boxRepository: BoxRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBoxDto): Promise<BoxEntity> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const transactionRepo = new TransactionRepository(manager);
      const newBox = await transactionRepo.createBox(dto);

      if (dto.productIds && dto.productIds.length > 0) {
        for (const productId of dto.productIds) {
          const product = await transactionRepo.findProductById(productId);
          if (!product) {
            throw new NotFoundException(`Product with id ${productId} not found`);
          }
          if (product.box_id) {
            throw new BusinessRuleViolationException(
              `Product with id ${productId} is already in another box.`,
            );
          }
          await transactionRepo.updateProductBoxId(productId, newBox.id);
        }
      }
      return newBox;
    });
  }

  async addProducts(id: string, dto: AddProductsDto): Promise<BoxEntity> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const transactionRepo = new TransactionRepository(manager);

      const box = await transactionRepo.findBoxById(id);
      if (!box) {
        throw new NotFoundException(`Box with id ${id} not found`);
      }

      if (box.status !== BoxStatus.CREATED) {
        throw new BusinessRuleViolationException(
          `Cannot add products to a box with status ${box.status}. Only boxes with status CREATED can be modified.`,
        );
      }

      for (const productId of dto.productIds) {
        const product = await transactionRepo.findProductById(productId);
        if (!product) {
          throw new NotFoundException(`Product with id ${productId} not found`);
        }
        if (product.box_id) {
          throw new BusinessRuleViolationException(
            `Product with id ${productId} is already in another box.`,
          );
        }
      await transactionRepo.updateProductBoxId(productId, box.id);
      }

      const updatedBox = await transactionRepo.findBoxById(id);
      if (!updatedBox) {
        throw new NotFoundException(`Box with id ${id} not found`);
      }
      return updatedBox;
    });
  }

  async removeProducts(id: string, dto: RemoveProductsDto): Promise<BoxEntity> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const transactionRepo = new TransactionRepository(manager);

      const box = await transactionRepo.findBoxById(id);
      if (!box) {
        throw new NotFoundException(`Box with id ${id} not found`);
      }

      if (box.status !== BoxStatus.CREATED) {
        throw new BusinessRuleViolationException(
          `Cannot remove products from a box with status ${box.status}. Only boxes with status CREATED can be modified.`,
        );
      }

      for (const productId of dto.productIds) {
        const product = await transactionRepo.findProductById(productId);
        if (!product) {
          throw new NotFoundException(`Product with id ${productId} not found`);
        }
        if (product.box_id !== id) {
          throw new BusinessRuleViolationException(
            `Product with id ${productId} is not in this box.`,
          );
        }
        await transactionRepo.updateProductBoxId(productId, null);
      }

      const updatedBox = await transactionRepo.findBoxById(id);
      if (!updatedBox) {
        throw new NotFoundException(`Box with id ${id} not found`);
      }
      return updatedBox;
    });
  }


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

  async getById(id: string): Promise<BoxEntity> {
    const entity = await this.boxRepository.findById(id);
    if (!entity) throw new NotFoundException('Box not found');
    return entity;
  }

  async update(id: string, dto: UpdateBoxDto): Promise<BoxEntity> {
    const entity = await this.boxRepository.findById(id);
    if (!entity) throw new NotFoundException('Box not found');

    if (dto.status && dto.status !== entity.status) {
      this.validateStatusTransition(entity.status, dto.status);
    }

    const updatedEntity = await this.boxRepository.update(id, dto);
    if (!updatedEntity) throw new NotFoundException('Box not found');

    return updatedEntity;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.boxRepository.findById(id);
    if (!entity) throw new NotFoundException('Box not found');

    if (entity.status !== BoxStatus.CREATED) {
      throw new BusinessRuleViolationException(
        `Cannot delete box with status ${entity.status}. Only boxes with status CREATED can be deleted.`
      );
    }

    const removed = await this.boxRepository.remove(id);
    if (!removed) throw new NotFoundException('Box not found');
  }

  private validateStatusTransition(currentStatus: BoxStatus, newStatus: BoxStatus): void {
    const validTransitions: Record<BoxStatus, BoxStatus[]> = {
      [BoxStatus.CREATED]: [BoxStatus.SEALED],
      [BoxStatus.SEALED]: [BoxStatus.SHIPPED],
      [BoxStatus.SHIPPED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStatusTransitionException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Valid transitions from ${currentStatus}: ${allowedTransitions.join(', ') || 'none'}`
      );
    }
  }
}
