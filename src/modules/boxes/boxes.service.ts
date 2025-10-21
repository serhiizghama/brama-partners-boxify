import { Injectable, NotFoundException } from '@nestjs/common';
import { ListBoxesQuery } from './dto/list-boxes.query';
import { UpdateBoxDto } from './dto/update-box.dto';
import { BoxRepository } from './infrastructure/box.repository';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { BoxStatus } from '../../domain/boxes/enums/box-status.enum';
import { BusinessRuleViolationException, InvalidStatusTransitionException } from '../../common/exceptions';

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
