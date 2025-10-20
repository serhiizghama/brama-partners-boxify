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
import { BoxEntity } from '../boxes/box.entity';

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

  @Column({ type: 'uuid', nullable: true })
  boxId: string | null;

  @ManyToOne(() => BoxEntity, (box) => box.products, { nullable: true })
  @JoinColumn({ name: 'boxId' })
  box?: BoxEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
