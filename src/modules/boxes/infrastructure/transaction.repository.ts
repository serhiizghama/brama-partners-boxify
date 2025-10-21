import { EntityManager } from 'typeorm';
import { BoxEntity } from '../../../domain/boxes/entities/box.entity';
import { ProductEntity } from '../../../domain/products/entities/product.entity';
import { CreateBoxDto } from '../dto/create-box.dto';

export class TransactionRepository {
  constructor(private readonly manager: EntityManager) {}

  async createBox(dto: CreateBoxDto): Promise<BoxEntity> {
    const repo = this.manager.getRepository(BoxEntity);
    const entity = repo.create(dto);
    return await repo.save(entity);
  }

  async findProductById(id: string): Promise<ProductEntity | null> {
    const repo = this.manager.getRepository(ProductEntity);
    return await repo.findOne({ where: { id } });
  }

  async updateProductBoxId(productId: string, boxId: string): Promise<ProductEntity | null> {
    const repo = this.manager.getRepository(ProductEntity);
    const entity = await repo.findOne({ where: { id: productId } });
    if (!entity) return null;

    entity.box_id = boxId;
    return await repo.save(entity);
  }
}
