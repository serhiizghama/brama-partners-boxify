import { EntityManager, Repository } from 'typeorm';
import { BoxEntity } from '../../../domain/boxes/entities/box.entity';
import { ProductEntity } from '../../../domain/products/entities/product.entity';
import { CreateBoxDto } from '../dto/create-box.dto';

export class TransactionRepository {
  private readonly boxRepo: Repository<BoxEntity>;
  private readonly productRepo: Repository<ProductEntity>;

  constructor(private readonly manager: EntityManager) {
    this.boxRepo = this.manager.getRepository(BoxEntity);
    this.productRepo = this.manager.getRepository(ProductEntity);
  }

  async createBox(dto: CreateBoxDto): Promise<BoxEntity> {
    const entity = this.boxRepo.create(dto);
    return await this.boxRepo.save(entity);
  }

  async findBoxById(id: string): Promise<BoxEntity | null> {
    return await this.boxRepo.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async findProductById(id: string): Promise<ProductEntity | null> {
    return await this.productRepo.findOne({ where: { id } });
  }

  async updateProductBoxId(id: string, box_id: string | null): Promise<void> {
    await this.productRepo.update(id, { box_id });
  }
}