import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BoxEntity } from '../../boxes/entities/box.entity';

@Entity('products')
@Unique(['barcode'])
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  @Index()
  barcode!: string;

  @Column({ name: 'box_id', type: 'uuid', nullable: true })
  box_id: string | null;

  @ManyToOne(() => BoxEntity, (box) => box.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'box_id' })
  box?: BoxEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}
