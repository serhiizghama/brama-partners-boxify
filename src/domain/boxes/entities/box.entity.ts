import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BoxStatus } from '../enums/box-status.enum';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('boxes')
@Unique(['label'])
export class BoxEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  label!: string;

  @Column({
    type: 'enum',
    enum: BoxStatus,
    default: BoxStatus.CREATED,
  })
  status!: BoxStatus;

  @OneToMany(() => ProductEntity, (product) => product.box, {
    cascade: true,
  })
  products!: ProductEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}
