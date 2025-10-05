import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

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

  // TODO remove null
  @Column({ type: 'uuid', nullable: true })
  boxId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
